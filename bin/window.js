const { app, BrowserWindow, ipcMain, ipcRenderer} = require('electron');
let windows = {};
const Create = require('./doc');
const create = new Create();
const Host = require('./Class/host');
const path = require("path");
const host = new Host();
const md5 = require('md5');

const Connection = require('./connection');

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
            icon: './bin/render/Dowssh.ico',
            webPreferences: {
                webviewTag: true,
                nodeIntegration: true,
                contextIsolation: false
            }
        })
        windows.start.loadFile('./bin/render/start.html');
        setTimeout(async () => callback(windows.start), 500);
    });
}

const application = async(callback) => {

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

        setTimeout(async() =>  windows.start.close(), 500)
        setTimeout(async () => {
            callback(windows.application)
        }, 1500);

}

const sendData = (type, data) => windows.application.send(type, data);

let paths = {
    'hosts': {type: "folder", path: 'profile/hosts'}
}
ipcMain.on("profiler-get", async (event, type) => {

    if(type === "hosts") {
        let datas = await host.getAll();
        let hosts = {};
        // Delete Password For security reason */
       for(let i =0; i < datas.length; i++)
            hosts[datas[i].uuid] = {host: datas[i].host, uuid: datas[i].uuid, port: datas[i].port, username: datas[i].username, name: datas[i].name};
        await host.getAll(true);
        return sendData('profiler-' + type, hosts)
    } else {
        if(create.exist(paths[type].path)) {
            await create.read(paths[type].path, (data) => {
                sendData('profiler-' + type, data)
            });
        }
    }
})
ipcMain.on("profiler-add", async (event, data) => {
    const type = data.type;
    const value = data.data;
    if(!type || !value) return sendData('profiler-callback', {type: "addHost", error: true, message: "Invalid Form"});
    if(type === "host") return host.add(value, (obj) => sendData('profiler-callback', obj));
})
let connections = {};
setInterval(() => {
    if(Object.keys(connections).length > 0)
        for (const [key, value] of Object.entries(connections))
            if(value.destroyed) delete connections[key];

}, 1000)

ipcMain.on('profiler-connect', async (event, uuid) => {
    const conn_id = md5(new Date().getTime() + uuid);
    sendData('profiler-connect-status', { status: 0, uuid: uuid, conn_id: conn_id })
    connections[conn_id] = new Connection(windows.application, conn_id, uuid);
})
ipcMain.on('profiler-disconnect', async (event, conn_id) => {
    if(!connections[conn_id]) return;
    delete connections[conn_id];
    console.log(conn_id + " => closed")
})

ipcMain.on('profiler-sftp-list', async (event, data) => {
    if(connections[data.conn_id]) connections[data.conn_id].action('list', data.path);
})



ipcMain.on('window', async (event, data) => {
    if(data === "reduce")
        windows.application.isMinimized() ? windows.application.restore() : windows.application.minimize()
    if(data === "close")
        windows.application.close()


})



exports.application = application;
exports.start = start;