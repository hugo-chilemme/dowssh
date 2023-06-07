const { BrowserWindow } = require('electron');
const RouterPages = require('../apps/routes.json');

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
    Navigate('/');
}

const Navigate = (name) => {
    const Page = RouterPages[name];

    if (!Page) {
        return console.error('Page not found');
    }

    window.loadURL(process.cwd() + '/bin/apps/' + Page);
}