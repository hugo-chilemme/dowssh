const {app, BrowserWindow, ipcMain, ipcRenderer} = require('electron');

const Create = require('./doc');
const window = require('./window');

const exec = require('child_process').exec;

const fs = require('fs-extra');
const unzipper = require('unzipper');


const Client = require('ssh2-sftp-client');
const axios = require('axios');
const prompt = require('prompt-sync')();

const create = new Create();
const checkUpdate = async () => {
    window.start(async (win) => {

        if (await create.folder('bin/core')) await create.file('bin/core/version.md', "");

        let version = null;
        fs.readFile(process.cwd() + '/bin/core/version.md', function (err, data) {
            if (err) throw err;
            version = data.toString();
        });

        await create.folders(['profile', 'profile/cache', 'profile/hosts', 'profile/downloads'], async (path) => {
            win.webContents.send('create', path)
        })
        await create.file('profile/cache/remote_directory.json', "{}", false, async (path) => {
            win.webContents.send('create', path)
        });

        win.webContents.send('update', "search")
        exec("git status", (error, stdout, stderr) => {
            if (stdout.includes('git add')) return start(win);
            exec("git pull", (error, stdout, stderr) => {
                win.webContents.send('update', "install")
                app.relaunch();
                app.exit();
            });
        });
    });
}


const start = async (win) => {
    win.webContents.send('update', "start")
    setTimeout(() => {
        window.application(async (win) => {
            // return app.start();
        });
    }, 2000)
}
exports.checkUpdate = checkUpdate;