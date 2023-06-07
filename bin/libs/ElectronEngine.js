const { app } = require('electron');
const ElectronRouter = require('./ElectronRouter');

/*
    Loading Handlers Events 
*/
require('./events/handleHeader');


app.whenReady().then(() => ElectronRouter.init());