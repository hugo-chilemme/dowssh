const { ipcRenderer } = require("electron");


const createItem = (host) => {
    const item = document.createElement('div');
    item.classList.add('item');
    item.addEventListener('dblclick', () => {
        Navigate('explorer', host);
    })
    item.setAttribute('host-id', host.uuid);

    const div = document.createElement('div');
    const h3 = document.createElement('h3');
    h3.innerText = host.label || host.address;

    const h5 = document.createElement('h5');
    h5.innerText = `${host.address}:${host.port}`;

    div.appendChild(h3);
    div.appendChild(h5);

    const icon = document.createElement('div');
    const i = document.createElement('i');
    i.addEventListener('click', () => {
        Navigate('hostManager', host);
    })
    i.className = 'bx bxs-pencil';

    icon.appendChild(i);
    item.appendChild(div);
    item.appendChild(icon);
    return item;
};

const refreshList = async () => {
    document.querySelector('.all-hosts.is-empty').classList.add('hide');
    const lists = document.querySelector('.all-hosts');
    lists.innerHTML = "";

    const hosts = await ipcRenderer.invoke('getUserHosts');
    if (Object.keys(hosts).length === 0) {
        document.querySelector('.all-hosts.is-empty').classList.remove('hide');
    }

    for (const host of Object.values(hosts)) {
        lists.appendChild(createItem(host));
    }
}


document.querySelector('section[page-name="dashboard"]').addEventListener("onshow", (event) => {
    refreshList();
});

