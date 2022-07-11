const { app, BrowserWindow } = require('electron')
let windows = {};

/* Starter windows */
const start = async(callback) => {
    app.whenReady().then(() => {
        windows.start = new BrowserWindow({
            width: 450,
            height: 450,
            center: true,
            resizable: false,
            transparent: true,
            frame: false,
            webPreferences: {
                webviewTag: true,
                nodeIntegration: true,
                contextIsolation: false
            }
        })
        windows.start.loadFile('./bin/render/start.html');
        setTimeout(async () => callback(windows.start), 2000);
    });
}

const application = async(callback) => {
        windows.application = new BrowserWindow({
            width: 1400,
            height: 850,
            center: true,
            resizable: false,
            transparent: true,
            frame: false,
            webPreferences: {
                webviewTag: true,
                nodeIntegration: true,
                contextIsolation: false
            }
        })
        windows.start.setAlwaysOnTop(true, "floating");
        windows.start.setFullScreenable(false);
        // Below statement completes the flow
        windows.start.moveTop();
        windows.application.loadFile('./bin/render/app.html');
        setTimeout(async () => {
            callback(windows.application)
            windows.start.close();

        }, 2000);

}
exports.application = application;
exports.start = start;