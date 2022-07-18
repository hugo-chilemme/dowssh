console.log('modules/hosting.js loaded');


const elementConnections = doc.querySelector('.connections');
const elementRepositories = doc.querySelector('.connections .repositories');
const elementHome = doc.querySelector('.home');

doc.querySelector('.hosts').addEventListener("click", event => {
    const element = event.target.closest('.item');
    if (!element) return;
})

let connections = {};
ipcRenderer.on('profiler-connect-status', async (event, data) => {
    if (!connections[data.conn_id]) connections[data.conn_id] = data;
    if (data.status === 0) {

        const div_conn = doc.createElement('div');
        console.log(data)
        div_conn.setAttribute('id', 'conn-' + data.conn_id);
        div_conn.classList.add('conn-id');
        const sidebars = doc.createElement('div');
        sidebars.classList.add('sidebars');
        const sidebars_h3 = doc.createElement('h3');
        sidebars_h3.innerText = `${hosts[data.uuid].host}:${hosts[data.uuid].port}`;
        const sidebars_p = doc.createElement('p');
        sidebars_p.innerText = "Connecting...";
        sidebars.appendChild(sidebars_h3);
        sidebars.appendChild(sidebars_p);
        div_conn.appendChild(sidebars);
        const repositories = doc.createElement('div');
        repositories.classList.add('repositories');
        repositories.innerHTML = `<div class="loading"><div class="loader-animation"><span></span><span></span><span></span></div></div>`;
        div_conn.appendChild(repositories);
        elementConnections.appendChild(div_conn);
        let name = hosts[data.uuid].host;
        if(hosts[data.uuid].name) name = hosts[data.uuid].name;
        document.querySelector('#onglets').innerHTML += `<div id="tab-${data.conn_id}" uuid="${data.conn_id}" class="item"><div><i class='bx bx-broadcast' ></i></div><div><h4>${name}</h4><p>${hosts[data.uuid].host}:${hosts[data.uuid].port}</p></div><div><div class="closed"><i class='bx bx-x'></i></div></div></div>`
        renewTabs();
    }
    if (data.status === 1) {

        const uuid = connections[data.conn_id].uuid;
        elementConnections.classList.remove('hide');
        elementHome.classList.add('hide');

        let repos = '/root';
        if (hosts[uuid].username !== "root") repos = "/home/" + hosts[uuid].username;
        sendData('profiler-sftp-list', {conn_id: data.conn_id, path: repos});
        doc.querySelector('.connections .sidebars p').innerText = `Listing ${repos}...`;
        doc.querySelector('.loader').style.display = "none";
    }
    if (data.status === 3) {
        elementHome.classList.remove('hide');
        const uuid = connections[data.conn_id].uuid;
        doc.querySelector('#tab-'+data.conn_id).remove();
        document.querySelector('#conn-'+data.conn_id).remove();
        doc.querySelectorAll('.connections .conn-id').forEach((e) => e.classList.add('hide'));
        doc.querySelector('.home').classList.remove('hide');

        doc.querySelector('.connections').classList.add('hide');
        notification.error(hosts[uuid].host + " : "+data.error);
        doc.querySelector('.loader').style.display = "none";
    }
})
let path_seek = null;

const renewTabs = () => {
    document.querySelectorAll('#onglets .item').forEach((e) => {
       let element = e;
        const uuid = element.getAttribute('uuid');
       element.addEventListener('click', (e) => {
           if(e.target.closest('.closed')) return;
            menu.displayConnection(uuid);
       })
        document.querySelector('#onglets .item#tab-'+uuid + " .closed").addEventListener('click', () => {
            
        })
    });
}
const elementClickable = (conn_id, repos, files) => {
    let repositories = doc.querySelector('.connections #conn-' + conn_id + " .repositories");
    for (let i = 0; i < repos.length; i++) {
        const element = document.querySelector(`.connections #conn-${conn_id} .repositories .item[repo="${repos[i]}"]`);
        element.addEventListener('dblclick', function (e) {
            repositories.innerHTML = `<div class="loading"><div class="loader-animation"><span></span><span></span><span></span></div></div>`;
            sendData('profiler-sftp-list', {conn_id: conn_id, path: e.target.closest('.item').getAttribute('target')});
        })
    }

    for (let i = 0; i < files.length; i++) {
        const element = document.querySelector(`.connections #conn-${conn_id} .repositories .item[file="${files[i]}"]`);
        element.addEventListener('dblclick', () => downloadFile(conn_id, files[i]));
    }

    for(let i = 0; i < doc.querySelectorAll('.connections #conn-' + conn_id + " .repositories .item").length; i++) {
        const element = doc.querySelectorAll('.connections #conn-' + conn_id + " .repositories .item")[i];
        element.addEventListener('click', function (e) {
            document.querySelectorAll(`.connections #conn-${conn_id} .repositories .item`).forEach(item => item.classList.remove('selected'));
            element.classList.add('selected');
        })
    }
}

const downloadFile = (conn_id, files_uuid) => {
    const element = document.querySelector(`.connections #conn-${conn_id} .repositories .item[file="${files_uuid}"]`);
    doc.querySelector('.connections #conn-' + conn_id + " .repositories").innerHTML = `<div class="loading"><div class="loader-animation"><span></span><span></span><span></span></div><p>Downloading ${element.getAttribute('name')} ...</p></div>`;
    doc.querySelector('.connections .sidebars p').innerText = `Downloading ${element.getAttribute('name')} ...`;
}

ipcRenderer.on('profiler-sftp-list', async (event, data) => {

    let repositories = doc.querySelector('.connections #conn-' + data.conn_id + " .repositories");
    repositories.innerHTML = "";
    let repos = [];
    let files = [];
    repositories.innerHTML += `<div class="head"><div></div><div>Name</div><div>Date Modified</div><div>Size</div></div>`;
    if (path_seek !== "/") {
        let path_split = data.path.split('/');
        let new_path = "/";

        if (path_split.length > 0) {
            path_split.pop();
            new_path = path_split.join('/');
            if (new_path === "") new_path = "/";
        }

        let uuid = genUuid();
        let item = doc.createElement('div');
        item.classList.add('item');

        item.setAttribute('target', new_path)
        item.setAttribute('repo', uuid)
        repos.push(uuid);

        item.innerHTML = `<div></div><div>..</div><div></div>`;
        item.classList.add('gray');
        repositories.appendChild(item);
    }

    let path = data.path;
    if(data.path === "/") path = "";
    for (const [key, value] of Object.entries(data.result)) {

        if(value.type === "d") {
            let uuid = genUuid();
            repositories.innerHTML += `<div class="item" target="${path}/${value.name}" repo="${uuid}"><div><i class='bx bx-folder'></i></div><div>${value.name}</div><div>${new Date(value.modifyTime).toLocaleString()}</div><div></div></div>`;
            repos.push(uuid);
        } else {
            let uuid = genUuid();
            files.push(uuid);

            let icone = `bx-file-blank`;
            let allOct = value.name.split('.')
            const ext = allOct[allOct.length-1];
            if(icones[ext]) icone = icones[ext];
            repositories.innerHTML += `<div class="item" file="${uuid}" name="${value.name}"><div><i class='bx ${icone}'></i> </div><div>${value.name}</div><div>${new Date(value.modifyTime).toLocaleString()}</div><div>${formatBytes(value.size)}</div></div>`;
        }
    }
    if(Object.entries(data.result).length === 0)  {
        repositories.innerHTML += "<error>Ce dossier est vide</error>";
    }


    doc.querySelector('.connections .sidebars p').innerText = `${data.path}`;
    elementClickable(data.conn_id, repos, files);
    path_seek = data.path;

});
doc.querySelector('.hosts').addEventListener("click", event => {
    if(!event.target.closest('.icon')) return;
    console.log('editor');
});
doc.querySelector('.hosts').addEventListener("dblclick", event => {
    const element = event.target.closest('.item');
    if(event.target.closest('.icon')) return;
    if (!element) return;
    const uuid = element.getAttribute('host');
    doc.querySelector('.loader stop').style.display = "inline-flex";
    doc.querySelector('.loader').style.display = "flex";
    menu.close();
    doc.querySelector('#loader-status').innerText = `Envoi de la demande`;
    sendData('profiler-connect', uuid);
})

doc.querySelector('[action="connect-cancel"]').addEventListener('click', async () => {
    doc.querySelector('#loader-status').innerText = `Tentative d'annulation...`;
    doc.querySelector('.loader').style.display = "none";
    doc.querySelector('.loader stop').style.display = "none";
})
