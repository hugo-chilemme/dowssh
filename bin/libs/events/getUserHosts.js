const { ipcMain, BrowserWindow } = require('electron');
const SessionStorage = require('../SessionStorage');

ipcMain.handle('getUserHosts', async (event, ...args) => {
    const result = await SessionStorage.all();
    return result
})