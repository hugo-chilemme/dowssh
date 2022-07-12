const { app, BrowserWindow, ipcMain } = require('electron')
let windows = {};
const Create = require('./doc');
const create = new Create();
const Host = require('./Class/host');
const path = require("path");
const host = new Host();

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
        windows.start.close();
        windows.application = new BrowserWindow({
            width: 1200,
            height: 650,
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

        }, 2000);

}

const sendData = (type, data) => windows.application.send(type, data);

let paths = {
    'hosts': {type: "folder", path: 'profile\\hosts'}
}
ipcMain.on("profiler-get", async (event, type) => {

    if(type === "hosts") {
        let datas = await host.getAll();
        let hosts = {};
        // Delete Password For security reason */
       for(let i =0; i < datas.length; i++)
            hosts[datas[i].uuid] = {host: datas[i].host, uuid: datas[i].uuid, port: datas[i].port, username: datas[i].username};
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





exports.application = application;
exports.start = start;