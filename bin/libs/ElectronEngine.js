const { app } = require('electron');
const ElectronRouter = require('./ElectronRouter');

/*
    Loading Handlers Events 
*/
require('./events/handleHeader');
require('./events/getUserHosts');


app.whenReady().then(() => ElectronRouter.init());