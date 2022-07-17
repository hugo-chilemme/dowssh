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

window.addEventListener('load', () => {
    setTimeout(() => {
        sendData('profiler-get', 'hosts')
    }, 0)
}, false)



ipcRenderer.on('profiler-callback', async (event, data) => {
    if (data.type === "addHost") return addHost(true, data)
})

const action = (type) => {
    if(type === "add-host") return addHost();
}