const {app} = require('electron');
const window = require('./window');
const exec = require('child_process').exec;


const bypass = true;


const checkUpdate = async () => {
    app.whenReady().then(async () => {
        await window.start(async (win) => {

            if(bypass) return window.application();
            win.webContents.send('update', "search");

            exec("git status --porcelain", (error, stdout) => {
                if (stdout.trim() === "") return window.application();
                win.webContents.send('update', "install");
                exec("git pull", () => {
                    app.relaunch();
                    return app.exit();

                });
            });

        });
    });
}


exports.checkUpdate = checkUpdate;