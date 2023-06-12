const { ipcMain, BrowserWindow } = require('electron');
const SessionStorage = require('../SessionStorage');

ipcMain.handle('addHost', async (event, hostData) => {
    try {
        if (hostData.uuid) {
            SessionStorage.edit(hostData.uuid, hostData);
        } else {
            SessionStorage.add(hostData);
        }
        return { ok: true };
    } catch (e) {
        return { ok: false, message: e.message };
    }
})


ipcMain.handle('delHost', async (event, uuid) => {
    SessionStorage.del(uuid);
})