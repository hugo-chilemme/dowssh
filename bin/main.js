const {app, BrowserWindow, ipcMain, ipcRenderer} = require('electron');

const Create = require('./doc');
const window = require('./window');

const exec = require('child_process').exec;

const fs = require('fs-extra');
const unzipper = require('unzipper');


const Client = require('ssh2-sftp-client');
const axios = require('axios');
const prompt = require('prompt-sync')();
const bypass = true;

const create = new Create();
const checkUpdate = async () => {
    app.whenReady().then(async () => {
        await window.start(async (win) => {
            await create.folders(['profile', 'profile/cache', 'profile/accounts', 'profile/hosts', 'profile/downloads']);
            if(bypass) return window.application();
            win.webContents.send('update', "search");

            exec("cd node_modules/geoip-lite && npm run-script updatedb license_key=13TAGtjQKv2aaR7H");
            exec("git status --porcelain", (error, stdout, stderr) => {
                if (stdout.trim() === "") return window.application();
                win.webContents.send('update', "install");
                exec("git pull", (error, stdout, stderr) => {
                    app.relaunch();
                    app.exit();
                    return;
                });
            });

        });
    });
}


exports.checkUpdate = checkUpdate;