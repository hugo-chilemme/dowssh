const {app, BrowserWindow, ipcMain, ipcRenderer} = require('electron');

const Create = require('./doc');
const create = new Create();
const Connection = require('./connection');
const Host = require('./Class/host');
const host = new Host();
const md5 = require('md5');

let connections = {};
let windows = {};



/* Starter windows */
const start = async (callback) => {
    app.whenReady().then(() => {
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
        windows.start.loadFile('./bin/render/start.html');
        setTimeout(async () => callback(windows.start), 1500);
    });
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

ipcMain.on('profiler-sftp-list', async (event, data) => {
    if (connections[data.conn_id]) connections[data.conn_id].action('list', data.path);
})


ipcMain.on('window', async (event, data) => {
    if (data === "reduce")
        windows.application.isMinimized() ? windows.application.restore() : windows.application.minimize()
    if (data === "close")
        windows.application.close()


})


exports.application = application;
exports.start = start;