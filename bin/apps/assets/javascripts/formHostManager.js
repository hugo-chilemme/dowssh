const { ipcRenderer } = require("electron");
const host = document.querySelector('.add-server [data-input="host"]');
const username = document.querySelector('.add-server [data-input="username"]');
const password = document.querySelector('.add-server [data-input="password"]');
const port = document.querySelector('.add-server [data-input="port"]');
const uuid = document.querySelector('.add-server [data-input="uuid"]');

document.querySelector('.add-server').addEventListener("onshow", (event) => {
    document.querySelector('.add-server .actions').classList.add('hide');
    const data = event.detail;
    host.value = data.host || "";
    username.value = data.username || "";
    port.value = data.port || 22;
    uuid.value = data.uuid || "";
    password.value = data.password || "";
    
    if (data.uuid) {
        document.querySelector('.add-server .actions').classList.remove('hide');
    }
});

document.querySelector('.add-server .button.save').addEventListener('click', async () => {
    
    document.querySelector('.add-server .error').classList.add('hide');

    const formData = {
        host: host.value,
        port: port.value,
        password: password.value,
        username: username.value,
        uuid: uuid.value,
    }

    console.log(formData);

    const res = await ipcRenderer.invoke('addHost', formData);
    if (!res.ok) {
        document.querySelector('.add-server .error').classList.remove('hide');
        document.querySelector('.add-server .error p').innerText = res.message;
        return;
    }
    Navigate('dashboard');

})  

document.querySelector('.add-server .button.delete').addEventListener('click', async () => {
    if (!uuid.value) return;
    await ipcRenderer.invoke('delHost', uuid.value);
    Navigate('dashboard');
});