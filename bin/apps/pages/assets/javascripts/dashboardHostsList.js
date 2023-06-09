const { ipcRenderer } = require("electron");

const hostsList = document.querySelector('#all-hosts');

(async () => {
    const hosts = await ipcRenderer.invoke('getUserHosts')
    console.log(hosts);
})();