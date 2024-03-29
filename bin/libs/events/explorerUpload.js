const { ipcMain, BrowserWindow } = require('electron');
const SessionStorage = require('../SessionStorage');
const fs = require('fs');

ipcMain.handle('explorerUpload', async (event, localPath, remotePath, onProgress) => {
    console.log(localPath, remotePath);
   try {
        const stats = fs.statSync(localPath);
        if (stats.isDirectory()) {
            await active_session.updir(localPath, remotePath);
        } else {
            await active_session.upfile(localPath, remotePath, (progress) => {
                event.sender.send('progress-upload', progress);
            });
        }
        return {ok: true, result: remotePath};
   } catch(e) {
        return {ok: false, message: e.message}
   }
})