const {BrowserWindow, ipcMain} = require('electron');

const Connection = require('./connection');
const Api = require('./api');
const api = new Api();

const Sync = require('./sync');
const sync = new Sync(api);

const Doc = require('./doc');
const doc = new Doc();

const Host = require('./Class/host');
const host = new Host();

const md5 = require('md5');

let connections = {};
let windows = {};



/* Starter windows */
const start = async (callback) => {
    windows.start = new BrowserWindow(doc.readSyst('/bin/Window/start.json'))
    windows.start.focus();
    await windows.start.loadFile('./bin/render/start.html');
    setTimeout(async () => {
        await api.connect();
        callback(windows.start)
    }, 1000)
}

const application = async () => {
    windows.application = new BrowserWindow(doc.readSyst('/bin/Window/application.json'));
    host.setWindows(windows);
    api.setWindows(windows);

    await windows.application.loadFile('./bin/render/app.html');


    windows.start.close()

    delete windows.start;
    await sync.start();
}

const sendData = (type, data) => windows.application.send(type, data);


ipcMain.on("onready", async (event, name) => {
    await api.isReady(name)
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


ipcMain.on('profiler-account', async () => {
    sendData('profiler-account-status', 1)
    if (windows.account) {
        await api.isSync();
        return windows.account.focus();
    }
    windows.account = new BrowserWindow(doc.readSyst('/bin/Window/account.json'))
    await windows.account.loadFile('./bin/render/account.html');
    api.setWindows(windows);
    host.setWindows(windows);
})



ipcMain.on('profiler-sftp-list', async (event, data) => {
    if (connections[data.conn_id]) connections[data.conn_id].action('list', data.path);
})


ipcMain.on('window', async (event, data) => {
    if (data.action === "reduce")
        windows[data.type].isMinimized() ? windows[data.type].restore() : windows[data.type].minimize()
    if (data.action === "close") {
        windows[data.type].close();
        delete windows[data.type];

        if (data.type === "application") {
            for (const [key, window] of Object.entries(windows)) {
                try {
                    window.close();
                } catch (e) {

                }
            }
            return;
        }
        api.setWindows(windows);
    }
})


exports.application = application;
exports.start = start;