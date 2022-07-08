const Create = require('./doc');
const app = require('./app');
const exec = require('child_process').exec;

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
    const result = await axios.get('https://api.github.com/repos/HugoCLI/dowssh/events', {})
        .then(result => {
            if (result.status !== 200) return start(); // Not connected
            let data = result.data[0];
            let last_version = data.id;
            if (version === last_version) return start();
            const response = prompt("Do you want to download the new version ? (Y/N) > ");
            if (response.toUpperCase() !== "Y") return start();
            create.delete('bin\\core\\version.md')
            exec("git pull", (error, stdout, stderr) => {
                create.file('bin\\core\\version.md', data.id);
                console.log('Success -> '+data.id);
                start();
            });
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