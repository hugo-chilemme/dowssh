const { ipcMain, BrowserWindow } = require('electron');
const SessionStorage = require('../SessionStorage');

ipcMain.handle('explorerList', async (event, path) => {
    if (!path) {
        path = active_session.username !== "root" ? `/home/${active_session.username}` : '/root';
    }
    return {
        path,
        result: await active_session.list(path)
    };
})