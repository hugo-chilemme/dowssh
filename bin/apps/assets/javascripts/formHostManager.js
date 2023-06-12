const { ipcRenderer } = require("electron");


document.querySelector('.add-server .submit .button').addEventListener('click', async () => {
    
    document.querySelector('.add-server .error').classList.add('hide');

    const formData = {
        address: document.querySelector('.add-server [data-input="address"]').value,
        port: document.querySelector('.add-server [data-input="port"]').value,
        password: document.querySelector('.add-server [data-input="password"]').value,
        username: document.querySelector('.add-server [data-input="username"]').value,
    }

    const res = await ipcRenderer.invoke('addHost', formData);
    if (!res.ok) {
        document.querySelector('.add-server .error').classList.remove('hide');
        document.querySelector('.add-server .error p').innerText = res.message;
        return;
    }
    Navigate('dashboard');

})  