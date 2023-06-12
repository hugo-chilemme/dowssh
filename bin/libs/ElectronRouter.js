const { BrowserWindow } = require('electron');
let window;

exports.init = () => {
    window = new BrowserWindow({
        width: 1400,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        frame: false,
    });
    window.loadURL(process.cwd() + '/bin/apps/index.html');
}
