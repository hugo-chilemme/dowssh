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
    app.whenReady().then(async () => {
        await window.start(async (win) => {

            await create.folders(['profile', 'profile/cache', 'bin/core', 'profile/hosts', 'profile/downloads']);
            win.webContents.send('update', "search");
            exec("git status --porcelain", (error, stdout, stderr) => {
                if (stdout.trim() === "") return window.application();
                win.webContents.send('update', "install");
                exec("git pull", (error, stdout, stderr) => {
                    app.relaunch();
                    app.exit();
                });
                return;
            });
            window.application();
        });
    });
}


exports.checkUpdate = checkUpdate;