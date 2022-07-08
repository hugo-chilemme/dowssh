const Create = require('./doc');
const app = require('./app');

const fs = require('fs');
const unzipper = require('unzipper');


const Client = require('ssh2-sftp-client');
const axios = require('axios');
const prompt = require('prompt-sync')();

const create = new Create();
console.log("")
const checkUpdate = async () => {
    if (await create.folder('bin/core'))
        await create.file('bin/core/version.md', "");

    let version = null;
    fs.readFile(process.cwd() + '\\bin\\core\\version.md', function (err, data) {
        if (err) throw err;
        version = data.toString();
    });

    const result = await axios.get('https://api.github.com/repos/HugoCLI/dowssh/releases/latest', {})
        .then(result => {
            if (result.status !== 200) return start(); // Not connected
            let last_version = result.data.tag_name;
            if (version === last_version) return start();
            const response = prompt("Do you want to download the new version ? (Y/N) > ");
            if (response.toUpperCase() !== "Y") return start();
            downloadNewVersion(result.data.zipball_url);
        })
        .catch(error => {
            console.log(error);
        });


}

const downloadNewVersion = async (url) => {
    create.folder('bin\\core\\.tmp')
    const {data, headers} = await axios({
        url: url,
        method: "GET",
        responseType: "stream",
    });

    const total = headers['content-length'];

    let downloaded = 0;
    data.on('data', (chunk) => {
        downloaded += chunk.length;
        let prc = 100 / total * downloaded;
       console.log(prc)
    })


    data.pipe(fs.createWriteStream(process.cwd() + '\\bin\\core\\.tmp\\install.zip'));
    data.on('end', async () => {

        setTimeout(async() => {

            let zip = fs.createReadStream(process.cwd() + '\\bin\\core\\.tmp\\install.zip');
            await zip.pipe(await unzipper.Extract({path: process.cwd() + '\\bin\\core\\.tmp\\'}));
            create.delete("bin\\core\\.tmp\\install.zip");

        }, 2000);
    });

}


const start = async () => {
    await app.configure();
    return app.start()
}
exports.checkUpdate = checkUpdate;