const { ipcMain } = require('electron');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');


ipcMain.handle('explorerRenameFile', async (event, targetPath, newName, oldName) => {

    await active_session.rename(targetPath + '/' + oldName, targetPath + '/' + newName);
    
});
