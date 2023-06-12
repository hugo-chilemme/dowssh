const { ipcMain, BrowserWindow } = require('electron');
const SessionStorage = require('../SessionStorage');

ipcMain.handle('addHost', async (event, hostData) => {
    try {
        SessionStorage.add(hostData);
        return { ok: true };
    } catch (e) {
        return { ok: false, message: e.message };
    }
})