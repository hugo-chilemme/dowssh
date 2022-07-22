const {app, BrowserWindow, ipcMain, ipcRenderer} = require('electron');

const Create = require('./doc');
const create = new Create();
const Connection = require('./connection');
const Api = require('./api');
const api = new Api();
const Host = require('./Class/host');
const host = new Host();
const md5 = require('md5');
const shell = require('electron').shell;
let connections = {};
let windows = {};


/* Starter windows */
const start = async (callback) => {
    windows.start = new BrowserWindow({
        width: 450,
        height: 450,
        center: true,
        resizable: false,
        transparent: true,
        frame: false,
        icon: './bin/render/Dowssh.ico',
        webPreferences: {
            webviewTag: true,
            nodeIntegration: true,
            contextIsolation: false
        }
    })
    windows.start.focus();
    windows.start.loadFile('./bin/render/start.html');
    await api.tryAuthentification();
    api.connect();
   setTimeout(() =>  callback(windows.start), 2000)
}

const application = async () => {

    windows.application = new BrowserWindow({
        width: 1300,
        height: 650,
        center: true,
        resizable: false,
        transparent: true,
        frame: false,
        icon: './bin/render/Dowssh.ico',
        webPreferences: {
            webviewTag: true,
            nodeIntegration: true,
            contextIsolation: false
        }
    })
    windows.application.loadFile('./bin/render/app.html');
    windows.start.close()
    delete windows.start;
    api.setBroadcast(windows);
}

const sendData = (type, data) => windows.application.send(type, data);

ipcMain.on("profiler-get", async (event, type) => {
    if (type !== "hosts") return;
    await host.list((hosts) => sendData('profiler-' + type, hosts))
})

ipcMain.on("profiler-add", async (event, data) => {
    if (data.type === "host") return host.add(data.data, (obj) => sendData('profiler-callback', obj));
})


setInterval(() => {
    if (Object.keys(connections).length > 0)
        for (const [key, value] of Object.entries(connections))
            if (value.connection.destroyed) delete connections[key];

}, 1000)

ipcMain.on('profiler-connect', async (event, uuid) => {
    const conn_id = md5(new Date().getTime() + uuid);
    sendData('profiler-connect-status', {status: 0, uuid: uuid, conn_id: conn_id})
    connections[conn_id] = new Connection(windows.application, conn_id, uuid);
})


ipcMain.on('profiler-disconnect', async (event, conn_id) => {
    if (!connections[conn_id]) return;
    delete connections[conn_id];

})
ipcMain.on('profiler-account', async (event) => {
    sendData('profiler-account-status', 1)
    if(windows.account) return windows.account.focus();
        windows.account = new BrowserWindow({
            width: 450,
            height: 650,
            resizable: false,
            transparent: true,
            center:false,
            x: 0,
            y: 0,
            frame: false,
            icon: './bin/render/Dowssh.ico',
            webPreferences: {
                webviewTag: true,
                nodeIntegration: true,
                contextIsolation: false
            }
        })
    api.setBroadcast(windows);
    windows.account.loadFile('./bin/render/account.html');
    await api.setWin(windows.account);
})


websocket = null;
request = false;
ipcMain.on('profiler-account-connect', async (event, site) => {

    await api.link(site);

});
ipcMain.on('profiler-sync-status', async (event) => {
    await api.synchronisation();
});
ipcMain.on('profiler-authentification', async (event, window) => {
    await api.authentification(windows[window]);
    // shell.openExternal("https://api.hugochilemme.com/authorize?scope="+md5(site))
});
ipcMain.on('profiler-settings-verification', async (event, window) => {
    await api.settingsVerification(windows['account']);
});

ipcMain.on('profiler-sftp-list', async (event, data) => {
    if (connections[data.conn_id]) connections[data.conn_id].action('list', data.path);
})


ipcMain.on('window', async (event, data) => {
    if (data.action === "reduce")
        windows[data.type].isMinimized() ? windows[data.type].restore() : windows[data.type].minimize()
    if (data.action === "close") {
        windows[data.type].close();
        delete windows[data.type];
        api.setBroadcast(windows);
    }


})


exports.application = application;
exports.start = start;