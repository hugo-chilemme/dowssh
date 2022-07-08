const Create = require('./doc');
const create = new Create();
const fs = require('fs');
const chalk = require('chalk');
let session = {folder_target:null}

const prompt = require('prompt-sync')();
let Client = require('ssh2-sftp-client');

const start = async () => {
    create.folder('profile');
    create.folder('profile\\cache');
    create.file('profile\\cache\\remote_directory.json', "{}");
    create.folder('profile\\hosts');
    create.folder('profile\\downloads');
    for (let i = 0; i < 5; i++) console.log("")
    form();
}

let sftp = new Client();
const form = async () => {

        const address = prompt('Remote address > ');
        const port = prompt('SFTP access port (22 by default) > ');
        const username = prompt('Username > ');
        const password = prompt('Password > ');

    console.log(`${address} \t${chalk.yellow('Try to connecting...')}`)
    sftp.connect({
        host: address,
        port: port,
        username: username,
        password: password
    }).then(() => {
        console.log(`${address} \t${chalk.green('Connected')}`);
        session.folder_target = "profile\\downloads\\" + address;
        create.folder(session.folder_target)
        session.folder_target += "\\";
        requestGet();
    }).then(data => {

    }).catch(err => {

    });

}

let global_size = 0;
let files = 0;
let directory = 0;
let async_num = 0;
let principal = null
const requestGet = async () => {
    const path = prompt('Directory to download > ');
    let ac = path;
    if (ac[ac.length - 1] === "/") ac = ac.substring(0, ac.length - 1);
    session.repositories = [];
    session.size = { total: 0, downloaded: 0, speed: 0 }
    session.statistics = {d: 0, f: 0}
    session.instance = 0;
    session.cache = { seek: 0};
    console.log(" ");
    async_num += 1;
    principal = ac;


    getSFTP(ac);
    liveDisplay();

}

function formatBytes(a, b = 2, k = 1024) {
    with (Math) {
        let d = floor(log(a) / log(k));
        return 0 == a ? "0 B" : parseFloat((a / pow(k, d)).toFixed(2)) + " " + ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][d]
    }
}

let totalSizeInSecond = 0;
const liveSpeed = async () => {
    if (session.instance === 0) return;
    session.size.speed = totalSizeInSecond*4;
    session.size.downloaded += totalSizeInSecond;
    totalSizeInSecond = 0;
    setTimeout(async () => liveSpeed(), 250)
}
const liveDisplay = async () => {
    if (session.instance === 0) return confirmDownload();
    clearLastLine();
    console.log("Calculating...\tSize: " + chalk.yellow(formatBytes(session.size.total)) + "\tFiles: " + chalk.yellow(session.statistics.f) + "\tDirectory: " + chalk.yellow(session.statistics.d)+"\tConnexion: "+chalk.yellow(session.instance));
    setTimeout(async () => liveDisplay(), 250)
}

const confirmDownload = () => {

    const rep = prompt('Voulez-vous télécharger ' + formatBytes(session.size.total) + " ? [(Y)es / (N)o] > ");
    if (rep[0] === "Y") {
        session.instance = 0;
        download();
        liveSpeed();
        return;
    }
    return process.exit(-1)
}

const download = async () => {
    if (session.repositories.length > 0) {
        if (session.instance < 30) {
            session.instance += 1;
            downloadFile(session.repositories[0])
            session.repositories.shift();
            if(session.instance < 30) download();
        }
        return;
    }
    console.log("\nEnd. Files availables : " + process.cwd() + "\\" + session.folder_target);
    process.exit(-1)
}

const downloadFile = async (data) => {
    const element = data.split('::');
    const type = element[0];

    const size = parseInt(element[1]);
    totalSizeInSecond += size;

    const path_dym = element[2].substring(principal.length + 1, element[2].length);
    if (type === "d") {
        await create.folder(session.folder_target + path_dym)
    } else {

        let get_folder = (session.folder_target + path_dym).split('/');
        let name = get_folder[get_folder.length - 1];
        get_folder.pop();

        get_folder = get_folder.join("\\");
        await create.folder(get_folder)


        if (await create.file(get_folder + "\\" + name, "")) {
            clearLastLine();
            console.log(chalk.gray(path_dym));
            console.log(chalk.yellow((100 / session.size.total * session.size.downloaded).toFixed(2) + "% ") + 'Downloading ... \t ' + chalk.cyan(formatBytes(session.size.speed)+"/s") + " \t"+formatBytes(session.size.downloaded) + " sur "+ formatBytes(session.size.total));

            let dst = fs.createWriteStream(process.cwd() + "\\" + get_folder + "\\" + name);
            await sftp.get(element[2], dst);
        }
    }
    session.instance -= 1;
    download();
}

const clearLastLine = () => {
    process.stdout.moveCursor(0, -1) // up one line
    process.stdout.clearLine(1) // from cursor to end
}

const getSFTP = async (path) => {
    if(session.instance < 50) {
        session.instance += 1;
        let ac = path;
        if (ac[ac.length - 1] === "/") ac = ac.substring(0, ac.length - 1);

        const result = await sftp.list(`${path}`);
        session.instance -= 1;
        traiteSFTP(ac, result)
    } else {
        setTimeout(async () => getSFTP(path), 1);
    }
}

const traiteSFTP = async (path, object) => {
    for (const [key, value] of Object.entries(object)) {
        session.size.total += parseInt(value.size);
        let type = "d"; if(value.type !== "d") type = "f";
        session.statistics[type] += 1;
        session.repositories.push(type + "::" + value.size + "::" + path + "/" + value.name)
        if(type === "d") getSFTP(`${path}/${value.name}/`);
    }

}


exports.start = start;
