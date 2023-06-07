const { ipcRenderer } = require('electron');

function minimizeWindow() {
  ipcRenderer.send('minimize-window');
}

function maximizeWindow() {
  ipcRenderer.send('maximize-window');
}

function closeWindow() {
  ipcRenderer.send('close-window');
}

// Attach event listeners to HTML elements
document.getElementById('minimize-button').addEventListener('click', minimizeWindow);
document.getElementById('maximize-button').addEventListener('click', maximizeWindow);
document.getElementById('close-button').addEventListener('click', closeWindow);
