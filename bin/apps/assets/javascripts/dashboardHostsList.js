const { ipcRenderer } = require("electron");
const d_loading = document.querySelector('.cfx-loading');

const createItem = (host) => {
    const item = document.createElement('div');
    item.classList.add('item');
    item.addEventListener('dblclick', async () => {
        d_loading.classList.remove('hide');
        d_loading.querySelector('.cfx-loading-progress span').style.animation = "connecting 1.5s infinite linear";
        d_loading.querySelector('h5').innerText = `Connecting to ${host.host}:${host.port}...`;

        const session = await ipcRenderer.invoke('explorerConnect', host.uuid);

        d_loading.classList.add('hide');
        if (!session.ok) {
            Navigate('dashboard', session);
        }
        Navigate('explorer');
    })
    item.setAttribute('host-id', host.uuid);

    const div = document.createElement('div');
    const h3 = document.createElement('h3');
    h3.innerText = host.label || host.host;

    const h5 = document.createElement('h5');
    h5.innerText = `${host.host}:${host.port}`;

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
    console.log(hosts)

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

