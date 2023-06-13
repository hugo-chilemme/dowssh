const { ipcRenderer } = require("electron");
global.current_path;
global.active_session;

const setDisplayedPath = (path) => {
    const working_e = document.querySelector('#explorer-path');
    working_e.innerHTML = "";
    
    let folders = path.split('/').slice(1);
    current_path = folders;
    
    if (path === "/") return;
    
    
    let teleportPath = [];
    for (let i = 0; i < folders.length; i++) {
        const e = folders[i];
        if (e === "") continue;
        const span = document.createElement('span');
        teleportPath.push(e);
        const c = '/' + teleportPath.join('/');
        span.innerHTML = `${e} <i class='bx bx-chevron-right' ></i>`;
        span.addEventListener('click', () => {
            loadPath(c);
        })
        working_e.appendChild(span);
    }
}

function formatBytes(bytes) {
    if (bytes === 0) {
        return '0 B';
    }
    
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
  
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  
  const CreateInterfaceItem = (file) => {
      if (file.name !== ".." && file.name[0] == ".") {
          return;
        }
        
        var row = document.createElement('tr');
        
        row.addEventListener('dblclick', () => {
            row.style.backgroundColor = "rgba(46, 161, 219, 0.25)";
            if (file.type === "d") {
                if (file.name === "..") {
                    current_path.pop();
                } else {
                    current_path.push(file.name);
            }
            loadPath('/' + current_path.join('/'));
        }
    })
    
    
    var iconCell = document.createElement('td');
    var icon = document.createElement('i');
    icon.className = file.type === 'd' ? 'bx bx-folder' : 'bx bx-file-blank'; 
    iconCell.appendChild(icon);
    row.appendChild(iconCell);
    
    var fileNameCell = document.createElement('td');
    fileNameCell.textContent = file.name;
    row.appendChild(fileNameCell);
    
    var sizeCell = document.createElement('td');
    if (file.size) {
        sizeCell.textContent = formatBytes(file.size);
    }
    row.appendChild(sizeCell);
    
    var lastModifiedCell = document.createElement('td');
    
    if (file.modifyTime) {
        const modifyTime = new Date(file.modifyTime);
        lastModifiedCell.textContent = modifyTime.toLocaleDateString() + ' ' + modifyTime.toLocaleTimeString() || "";
    }
    row.appendChild(lastModifiedCell);
    
    var permissionCell = document.createElement('td');
    if (file.longname) {
        permissionCell.textContent = file.longname.split(' ')[0];
    }
    row.appendChild(permissionCell);
    
    var ownerCell = document.createElement('td');
    if (file.username) {
        ownerCell.textContent = file.username;
    }
    row.appendChild(ownerCell);
    
    var tableBody = document.querySelector('#explorer-files'); // Sélectionnez votre élément tbody existant
    tableBody.appendChild(row);
    
    return tableBody;
    
}

const displayFoldersAndFiles = async (files) => {
    if (current_path.length > 0) {
        const i = await CreateInterfaceItem({name: '..', type: 'd'});
    }
    files.forEach(CreateInterfaceItem);
}


global.loadPath = async path => {
    const working_e = document.querySelector('#explorer-files');
    working_e.innerHTML = "";
    
    const repository = await ipcRenderer.invoke('explorerList', path);
    
    localStorage.setItem('latest_path', path);
    
    setDisplayedPath(repository.path);
    displayFoldersAndFiles(repository.result);
}

const handleLoad = () => {
    const path = localStorage.getItem('latest_path');

    loadPath(path);
}

document.querySelector('#refresh-button').addEventListener('click', handleLoad);
document.querySelector('[page-name="explorer"]').addEventListener("onshow", handleLoad);
document.querySelector('.explorer .header .route').addEventListener('click', () => loadPath('/'));
