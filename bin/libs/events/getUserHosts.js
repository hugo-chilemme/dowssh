const { ipcMain, BrowserWindow } = require('electron');
const SessionStorage = require('../SessionStorage');

ipcMain.handle('getUserHosts', async (event) => {
    return await SessionStorage.all();
})