const { app } = require('electron');
const ElectronRouter = require('./ElectronRouter');

app.whenReady().then(() => ElectronRouter.init());