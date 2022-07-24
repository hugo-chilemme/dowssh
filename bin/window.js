const {BrowserWindow, ipcMain} = require('electron');

const Connection = require('./connection');
const Api = require('./api');
const api = new Api();

const Sync = require('./sync');
const sync = new Sync(api);


const Host = require('./Class/host');
const host = new Host();
const md5 = require('md5');

let connections = {};
let windows = {};



/* Starter windows */
const start = async (callback) => {

    windows.start = new BrowserWindow({
        width: 350,
        height: 350,
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
    await windows.start.loadFile('./bin/render/start.html');
    setTimeout(async () => {
        await api.connect();
        callback(windows.start)
    }, 1000)
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
    await windows.application.loadFile('./bin/render/app.html');

    api.setWindows(windows);
    windows.start.close()
    delete windows.start;
    await sync.start();
    await api.isReady('application')

}

const sendData = (type, data) => windows.application.send(type, data);

ipcMain.on("profiler-get", async (event, type) => {
    if (type !== "hosts") return;
    await host.list((hosts) => sendData('profiler-' + type, hosts))
})

ipcMain.on("profiler-add", async (event, data) => {
    if (data.type === "host") return host.add(data.data, (obj) => {
        sendData('profiler-callback', obj)
    });
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
    windows.account = new BrowserWindow({
        width: 450,
        height: 650,
        resizable: false,
        transparent: true,
        center: false,
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
    await windows.account.loadFile('./bin/render/account.html');
    api.setWindows(windows);
    await api.isReady('account')

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
            console.log('Aborded')
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