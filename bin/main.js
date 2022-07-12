const Create = require('./doc');
const app = require('./app');
const window = require('./window');

const exec = require('child_process').exec;

const fs = require('fs-extra');
const unzipper = require('unzipper');


const Client = require('ssh2-sftp-client');
const axios = require('axios');
const prompt = require('prompt-sync')();

const create = new Create();
console.log("")
const checkUpdate = async () => {
    window.start(async (win) => {

        if (await create.folder('bin/core')) await create.file('bin/core/version.md', "");

        let version = null;
        fs.readFile(process.cwd() + '\\bin\\core\\version.md', function (err, data) {
            if (err) throw err;
            version = data.toString();
        });

        await create.folders(['profile', 'profile\\cache', 'profile\\hosts', 'profile\\downloads'], async (path) => {
            win.webContents.send('create', path)
        })
        await create.file('profile\\cache\\remote_directory.json', "{}", false,async (path) => {
            win.webContents.send('create', path)
        });


        try {
                win.webContents.send('update', "search")
                await axios.get('https://api.github.com/repos/HugoCLI/dowssh/events', {}).then(result => {

                    if (result.status !== 200) return start(); // Not connected
                    const last_version = result.data[0].id;
                    if (version === last_version) return start();
                    win.webContents.send('update', "download")
                    exec("git pull", (error, stdout, stderr) => {
                        create.edit('bin\\core\\version.md', last_version)
                        start();
                    });
                })
        }catch (e) {
            start();
        }
    });
}



const start = async () => {
    setTimeout(() => {
        window.application(async (win) => {
            // return app.start();
        });
    }, 2000)
}
exports.checkUpdate = checkUpdate;