const Create = require('./doc');
const app = require('./app');
const shell = require('shelljs')

const fs = require('fs-extra');
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

            shell.cd(process.cwd());
            shell.exec('git checkout tags/'+result.data.tag_name)
        })
        .catch(error => {
            console.log(error);
        });


}





const start = async () => {
    await app.configure();
    return app.start()
}
exports.checkUpdate = checkUpdate;