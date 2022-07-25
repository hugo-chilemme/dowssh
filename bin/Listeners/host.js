const {ipcMain} = require('electron');

let host;
const define = (InsHost) => host = InsHost;
exports.define = define;

ipcMain.on("profiler-get", async (event, type) => {
    if (type !== "hosts") return;
    await host.list((hosts) => host.windows.application.send('profiler-' + type, hosts))
})

ipcMain.on("profiler-add", async (event, data) => {
    if (data.type === "host") return host.add(data.data, (obj) => {
        host.windows.application.send('profiler-callback', obj)
    });
})