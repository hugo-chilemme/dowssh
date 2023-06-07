const { ipcMain, BrowserWindow } = require('electron');

ipcMain.on('minimize-window', () => {
    const currentWindow = BrowserWindow.getFocusedWindow();
    if (currentWindow) {
        currentWindow.minimize();
    }
});


ipcMain.on('maximize-window', () => {
    const currentWindow = BrowserWindow.getFocusedWindow();
    if (currentWindow) {
        if (currentWindow.isMaximized()) {
            currentWindow.unmaximize();
        } else {
            currentWindow.maximize();
        }
    }
});


ipcMain.on('close-window', () => {
    const currentWindow = BrowserWindow.getFocusedWindow();
    if (currentWindow) {
        currentWindow.close();
    }
});
