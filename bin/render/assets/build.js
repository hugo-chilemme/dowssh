const {ipcRenderer} = require('electron')
console.log('build.js loaded');
let doc = document;


const sendData = (type, value) => {
    doc.querySelector('.loader').style.display = "flex";
    ipcRenderer.send(type, value);
}

window.addEventListener('load', () => {
    setTimeout(() => {
        sendData('profiler-get', 'hosts')
    }, 500)
}, false)

let hosts = {};
ipcRenderer.on('profiler-hosts', async (event, data) => {
    doc.querySelector('.hosts').innerHTML = "";
    for (const [key, value] of Object.entries(data)) {
        hosts[value.uuid] = value;
        doc.querySelector('.hosts').innerHTML += `<div onclick="connect('${value.uuid}')" class="item"><h5>${value.host}</h5><p>${value.username} — SFTP ${value.port}</p></div>`;
    }
    doc.querySelector('.loader').style.display = "none";
})


ipcRenderer.on('profiler-callback', async (event, data) => {
    if (data.type === "addHost") return addHost(true, data)
})


const action = (type) => {
    if (type === "add-host") return addHost();
}


let menu = {};
menu.open = () => {
    doc.querySelector('.main').classList.add('open-menu');
}
menu.close = () => {
    doc.querySelector('.main').classList.remove('open-menu');
}

let notification = {};
notification.element = doc.querySelector('.notification');
notification.display = (message) => {
    notification.element.innerText = message;
    notification.element.classList.add('show');
    setTimeout(async () => notification.element.classList.remove('show'), 3000);
}
notification.success = (message) => {
    notification.element.classList.remove('error');
    notification.display(message);
}
notification.error = (message) => {
    notification.element.classList.add('error')
    notification.display(message);
}

const addHost = (submit = false, data = null) => {
    menu.open();
    if (submit) {
        if (data) {
            if (data.error) return notification.error(data.message);
            notification.success("Ajouté avec succès");
            /* Callback : profiler-hosts */
            menu.close();
            doc.querySelector('.hosts').innerHTML += `<div onclick="connect('${data.uuid}')" class="item"><h5>${data.host}</h5><p>${data.username} — SFTP ${data.port}</p></div>`;
            doc.querySelectorAll('.addHost input').forEach(e => e.value.length = 0);
            hosts[data.uuid] = {uuid: data.uuid, username: data.username, port: data.port, host: data.host};
        } else {
            let forms = {};
            doc.querySelectorAll('.addHost input').forEach(e => forms[e.getAttribute('data')] = e.value);
            ipcRenderer.send('profiler-add', {type: 'host', data: forms});
        }
    }
}

const connect = (uuid) => {
    if(hosts[uuid]) {
        doc.querySelector('.loader').style.display = "flex";
        doc.querySelector('#loader-status').innerText = `Connexion à ${hosts[uuid].host}...`
    }
}