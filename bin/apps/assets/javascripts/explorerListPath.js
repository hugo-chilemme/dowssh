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
                if (file.name === "..") current_path.pop();
                else current_path.push(file.name);
                return loadPath('/' + current_path.join('/'));
            }
            console.log('fichier');

        })
    
    
    var iconCell = document.createElement('td');
    var icon = document.createElement('i');
    icon.className = 'bx bx-file-blank'; 
    if (file.type === "d") {
        icon.className = 'bx bx-folder';
    } else if(file.type === "l") {
        icon.className = 'bx bx-link-external';
    }
    iconCell.appendChild(icon);
    row.appendChild(iconCell);
    
    var fileNameCell = document.createElement('td');
    fileNameCell.textContent = file.name;
    row.appendChild(fileNameCell);
    
    var sizeCell = document.createElement('td');
    if (file.size || file.size === 0) {
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

const displayFoldersAndFiles = async (files, path) => {
    if (path !== "/") {
        const i = await CreateInterfaceItem({name: '..', type: 'd'});
    }
    files.forEach(CreateInterfaceItem);
}


global.loadPath = async path => {
    const working_e = document.querySelector('#explorer-files');
    working_e.innerHTML = "";
    let repository = await ipcRenderer.invoke('explorerList', path);
    const sort_by = JSON.parse(localStorage.getItem('sort_by')) || { sort: 'desc', name: 'type' };
    
    console.log(repository.result)
    repository.result.sort((a, b) => {
        if (a[sort_by.name] < b[sort_by.name]) {
            return -1;
        }
        if (a[sort_by.name] > b[sort_by.name]) {
            return 1;
        }
        return 0;
    });

    if (sort_by.sort === 'desc') {
        repository.result.reverse();
    }
    localStorage.setItem('latest_path', path);
    
    setDisplayedPath(repository.path);
    displayFoldersAndFiles(repository.result, repository.path);
}

const handleLoad = () => {
    const path = localStorage.getItem('latest_path');
    
    loadPath(path);
}


const handleOrder = (e) => {
    let sort_by = JSON.parse(localStorage.getItem('sort_by')) || { sort: 'desc', name: 'type' };
    const oName = e.target.getAttribute('order-name');
    if (!oName) return;
    
    if (sort_by.name === oName) {
        sort_by.sort = sort_by.sort === "asc" ? 'desc' : 'asc';
    } else {
        sort_by.sort = 'asc';
    }
    sort_by.name = oName;
    localStorage.setItem('sort_by', JSON.stringify(sort_by));
    handleLoad();
}

document.querySelector('#refresh-button').addEventListener('click', handleLoad);
document.querySelector('[page-name="explorer"]').addEventListener("onshow", handleLoad);
document.querySelector('.explorer .header .route').addEventListener('click', () => loadPath('/'));
document.querySelectorAll('.explorer thead th').forEach(e => e.addEventListener('click', handleOrder));