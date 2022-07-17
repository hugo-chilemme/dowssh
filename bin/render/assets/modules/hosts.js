console.log('modules/hosts.js loaded');

let hosts = {};
const elementHosts = doc.querySelector('.hosts');

ipcRenderer.on('profiler-hosts', async (event, data) => {
    doc.querySelector('.hosts').innerHTML = "";
    for (const [key, value] of Object.entries(data))
        addHostElement(value.uuid, value.host, value.username, value.port);
    doc.querySelector('.loader').style.display = "none";
})

const addHostElement = (uuid, host, username, port) => {
    elementHosts.innerHTML += `<div class="item" host="${uuid}"><h5>${host}</h5><p>${username} — SFTP ${port}</p></div>`;
    hosts[uuid] = {uuid: uuid, username: username, port: port, host: host};
}
doc.querySelector('[action="add-host"]').addEventListener('click', async (e) => {
   return addHost();
});

doc.querySelector('[action="add-host-submit"]').addEventListener('click', async (e) => {
    return addHost();
});
const addHost = (submit = false, data = null) => {
    menu.open();
    if (submit) {
        if (data) {
            if (data.error) return notification.error(data.message);
            notification.success("Ajouté avec succès");
            /* Callback : profiler-hosts */
            menu.close();
            addHostElement(data.uuid, data.host, data.username, data.port);
            doc.querySelectorAll('.addHost input').forEach(e => e.value.length = 0);
        } else {
            let forms = {};
            doc.querySelectorAll('.addHost input').forEach(e => forms[e.getAttribute('data')] = e.value);
            ipcRenderer.send('profiler-add', {type: 'host', data: forms});
        }
    }
}

