const {ipcRenderer} = require('electron')
console.log('build.js loaded');
let doc = document;


const sendData = (type, value) => {
    console.log(type, value);
    ipcRenderer.send(type, value);
}

window.addEventListener('load', () => {
    setTimeout(() => {
        sendData('profiler-get', 'hosts')
    }, 500)
}, false )


ipcRenderer.on('profiler-hosts', async (event, data) => {
    doc.querySelector('.hosts').innerHTML = "";
    for(const[key, value] of Object.entries(data)) {
        doc.querySelector('.hosts').innerHTML += `<div class="item"><h5>${value.host}</h5><p>${value.username} — SFTP ${value.port}</p></div>`;
    }
    doc.querySelector('.loader').remove();
})


ipcRenderer.on('profiler-callback', async (event, data) => {
    if(data.type === "addHost") return addHost(true, data)
})


const action = (type) => {
    if(type === "add-host") return addHost();
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
    setTimeout(async() => notification.element.classList.remove('show'), 3000);
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
    if(submit) {
        if(data) {
            if(data.error) return notification.error(data.message);
            sendData('profiler-get', 'hosts') /* Refresh */
            notification.success("Ajouté avec succès");
            menu.close();
        } else {
            let forms = {};
            doc.querySelectorAll('.addHost input').forEach(e => forms[e.getAttribute('data')] = e.value);
            ipcRenderer.send('profiler-add', {type: 'host', data: forms});
        }
    }
}