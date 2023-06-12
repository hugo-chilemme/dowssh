const { ipcRenderer } = require("electron");


const createItem = (host) => {
    const item = document.createElement('div');
    item.classList.add('item');
    item.setAttribute('host-id', host.uuid);

    const h3 = document.createElement('h3');
    h3.innerText = host.label || host.address;

    const h5 = document.createElement('h5');
    h5.innerText = `${host.address}:${host.port}`;

    item.appendChild(h3);
    item.appendChild(h5);
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

refreshList();
