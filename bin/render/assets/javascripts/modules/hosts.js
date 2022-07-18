console.log('modules/hosts.js loaded');

let hosts = {};
const elementHosts = doc.querySelector('.hosts');

ipcRenderer.on('profiler-hosts', async (event, data) => {
    doc.querySelector('.hosts').innerHTML = "";
    console.log(data);
    for (const [key, value] of Object.entries(data))
        addHostElement(value.uuid, value.host, value.username, value.port, value.name);
    doc.querySelector('.loader').style.display = "none";
})

const addHostElement = (uuid, host, username, port, name) => {
    if(name && name.length > 0)
        elementHosts.innerHTML += `<div class="item" host="${uuid}"><div><h5>${name}</h5><p>${host}:${port} — ${username}</p></div><div class="icon"><i class='bx bxs-pencil' ></i></div></div>`;
    else
        elementHosts.innerHTML += `<div class="item" host="${uuid}"><div><h5>${host}</h5><p>${host}:${port} — ${username}</p></div><div class="icon"><i class='bx bxs-pencil' ></i></div></div>`;

    hosts[uuid] = {uuid: uuid, username: username, port: port, host: host};
}
doc.querySelector('[action="add-host"]').addEventListener('click', async (e) => {
   return addHost();
});

doc.querySelector('[action="add-host-submit"]').addEventListener('click', async (e) => {
    return addHost(true);
});
doc.querySelector('input[data="name"]').addEventListener('input', async (e) => {
    const element = doc.querySelector('input[data="name"]');
    const addr = doc.querySelector('input[data="host"]');
    if(element.value.length < 32 && element.value.length > 0) return doc.querySelector('.addHost h2').innerText = element.value;
    else doc.querySelector('.addHost h2').innerText = "Nouveau serveur";
});
doc.querySelector('[action="menu-add-field"]').addEventListener('click', async (e) => {
    if(!doc.querySelector('.inputs-list').classList.contains('open')) return doc.querySelector('.inputs-list').classList.add('open');
    return doc.querySelector('.inputs-list').classList.remove('open')
});

doc.querySelector('.field-dropdown').addEventListener('click', async (e) => {
    const element = e.target.closest('.item');
    const id = element.getAttribute('field');
    const type = element.getAttribute('type');
    element.classList.add('hide');
    doc.querySelector('#addedinputs').innerHTML += `<label target-id="${id}">${element.innerText}</label><input target-id="${id}" data="${id}" type="${type}"><delete target-id="${id}"><i class='bx bx-minus'></i></delete>`;
    doc.querySelector('.inputs-list').classList.remove('open');
    const del = doc.querySelector('delete[target-id="'+id+'"]');
    del.addEventListener('click', async (e) => {
        let getId = del.getAttribute('target-id');
        document.querySelector('.field-dropdown [field="'+getId+'"]').classList.remove('hide');
        document.querySelectorAll('[target-id="'+getId+'"]').forEach((e) => e.remove());
    });
});



const addHost = (submit = false, data = null) => {
    menu.open();
    if (submit) {
        if (data) {
            if (data.error) return notification.error(data.message);
            notification.success("Ajouté avec succès");
            /* Callback : profiler-hosts */
            menu.close();
            addHostElement(data.uuid, data.host, data.username, data.port, data.name);
            doc.querySelectorAll('.addHost input').forEach(e => e.value.length = 0);
        } else {
            let forms = {};
            doc.querySelectorAll('.addHost input').forEach(e => forms[e.getAttribute('data')] = e.value);
            ipcRenderer.send('profiler-add', {type: 'host', data: forms});
        }
    }
}

