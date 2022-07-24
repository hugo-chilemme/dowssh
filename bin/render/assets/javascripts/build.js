console.log('build.js loaded');

const {ipcRenderer} = require('electron');
const doc = document;
const icones = {
    "doc": "bxs-file-doc",
    "js": "bxs-file-js",
    "html": "bxs-file-html",
    "txt": "bxs-file-txt",
    "gif": "bxs-file-gif",
    "png": "bxs-file-png",
    "jpg": "bxs-file-jpg",
    "jpeg": "bxs-file-jpg",
    "md": "bxs-file-md",
    "css": "bxs-file-css",
    "json": "bxs-file-json",
    "zip": "bxs-file-archive",
    "tar": "bxs-file-archive",
    "xz": "bxs-file-archive",
    "gz": "bxs-file-archive",
}


const sendData = (type, value) => {
    if(type==="profiler-connect") console.log('Connecting to '+value);
    ipcRenderer.send(type, value);
}
doc.querySelector('[action="onglet-sync"]').addEventListener('click', () => {
    doc.querySelector('.loader').style.display = "flex";
    sendData("profiler-account", "open");
})
doc.querySelector('[action="onglet-account"]').addEventListener('click', () => {
    doc.querySelector('.loader').style.display = "flex";
    sendData("profiler-account", "open");
})
ipcRenderer.on('profiler-account-status', async (event, data) => {
    doc.querySelector('.loader').style.display = "none";
})

window.addEventListener('load', () => {
    sendData('profiler-get', 'hosts');
    ipcRenderer.send('api:get-account', 'application');
}, false)


ipcRenderer.on('api:get-account', async (event, data) => {
    if(data) return  doc.querySelector('.onglet-btn[action="onglet-account"]').innerHTML = `<img alt="account" src="${data.picture}">`;
    doc.querySelector('.onglet-btn[action="onglet-account"]').innerHTML = `<i class='bx bx-user-circle'></i>`;
    doc.querySelector('.onglet-btn[action="onglet-sync"]').classList.add('hide');
});


ipcRenderer.on('profiler-sync', async (event, status) => {
    if(status === 3) return doc.querySelector('.onglet-btn[action="onglet-sync"]').classList.remove('hide');
    doc.querySelector('.onglet-btn[action="onglet-sync"]').classList.add('hide');
    setTimeout(async () => ipcRenderer.send('profiler-sync-status'), 1000)
});

ipcRenderer.on('profiler-callback', async (event, data) => {
    if (data.type === "addHost") return addHost(true, data)
})

const action = (type) => {
    if(type === "add-host") return addHost();
}



