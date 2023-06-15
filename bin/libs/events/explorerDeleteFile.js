const { ipcMain } = require('electron');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');


ipcMain.handle('explorerDeleteFile', async (event, path) => {
  const localTarget = path;

  console.log(localTarget);

  const stats = await active_session.stat('/' + path);

  if (stats.isDirectory) {
    await active_session.rmdir('/' + path);
  } else {
    await active_session.rmfile('/' + path);
  }
  
});
