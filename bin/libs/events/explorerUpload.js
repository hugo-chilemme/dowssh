const { ipcMain, BrowserWindow } = require('electron');
const SessionStorage = require('../SessionStorage');

ipcMain.handle('explorerUpload', async (event, localPath, remotePath) => {
   try {
        await active_session.updir(localPath, remotePath);
        return {ok: true, result: remotePath};
   } catch(e) {
        return {ok: false, message: e.message}
   }
})