const {app, BrowserWindow, ipcMain, ipcRenderer} = require('electron');
const keytar = require("keytar");
const keytarStock = ['passphrase'];
let api;


const define = (InsApi) => api = InsApi;



ipcMain.on('api:open-link', async (event, site) => {
    await api.link(site);
});

ipcMain.on('api:get-account', async (event, window) => {
    await api.authentification(window);
});


ipcMain.on('api:set-settings', (event, data) => {
    if (!data.type || !data.value) return;
    if (!keytarStock.includes(data.type)) return profile.settings[data.type] = data.value;

    keytar.setPassword('settings-' + data.type, 'default', data.value);
    sendData({type: "user", scope: 'set-passphrase', value: data.value, session: oauth.config});
})

ipcMain.on('api:get-sync-status', async (event, window) => {
    await api.synchronisation();
});

exports.define = define;