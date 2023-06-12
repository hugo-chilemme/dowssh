const { ipcMain, BrowserWindow } = require('electron');
const SessionStorage = require('../SessionStorage');
const SFTPConnector = require('../SFTPConnector');

ipcMain.handle('explorerConnect', async (event, uuid) => {
    const host = SessionStorage.get(uuid);

    const endpoint = new SFTPConnector();
    const status = await endpoint.connect(host);

    if (status.ok) {
        active_session = endpoint;
    }
    return status;
})