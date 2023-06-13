const dropZone = document.querySelector('.explorer');

dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
});

dropZone.addEventListener('dragleave', (event) => {
    event.preventDefault();
});

ipcRenderer.on('progress-upload', (event, result) => {
    // Handle the result of the callback
    console.log(result);
});

dropZone.addEventListener('drop', async (event) => {
    event.preventDefault();

    if (!current_path) {
        return;
    }

    const files = Object.values(event.dataTransfer.files);
    const path = '/' + current_path.join('/');

    await files.forEach(async file => {
        console.log('Dropped file:', file.path);
        const res = await ipcRenderer.invoke('explorerUpload', file.path, path + '/' + file.name);
        if (res.ok) {
            loadPath(path);
        }
    });
});