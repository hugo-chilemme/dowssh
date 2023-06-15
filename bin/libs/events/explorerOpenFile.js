const { ipcMain } = require('electron');
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');
const fs = require('fs');
const tmpPath = process.cwd() + '/.workspace/';
let trackerStarted = false;


const createLocalFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};




ipcMain.handle('explorerOpenFile', async (event, path) => {
  const hash = uuidv4(path);
  const localTarget = tmpPath + path;

  console.log(path);

  const stats = await active_session.stat('/' + path);

  if (stats.isDirectory) {
    createLocalFolder(localTarget);
    await active_session.downdir('/' + path, localTarget);
  } else {
    let folders = path.split('/');
    folders.pop();
    let folderPath = tmpPath + folders.join('/');

    createLocalFolder(folderPath);

    await active_session.downfile('/' + path, localTarget);
  }
  console.log('downloaded');
  exec(`code "${localTarget}"`);


  fs.watch(localTarget, { recursive: true }, async (eventType, filename) => {
    if (stats.isDirectory) {
        await active_session.updir(localTarget, '/' + path);
    } else {
        await active_session.upfile(localTarget, '/' + path);
    }
    console.log('Successfully uploaded');
  });
  
});
