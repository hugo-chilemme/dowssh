console.log('build.js loaded');

const {ipcRenderer} = require('electron');
const doc = document;

const sendData = (type, value) => {
    doc.querySelector('.loader').style.display = "flex";
    ipcRenderer.send(type, value);
}

window.addEventListener('load', () => {
    setTimeout(() => {
        sendData('profiler-get', 'hosts')
    }, 500)
}, false)



ipcRenderer.on('profiler-callback', async (event, data) => {
    if (data.type === "addHost") return addHost(true, data)
})

const action = (type) => {
    if(type === "add-host") return addHost();
}