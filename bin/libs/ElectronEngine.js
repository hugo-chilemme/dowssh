const { app } = require('electron');
const ElectronRouter = require('./ElectronRouter');
global.active_session;

/*
    Loading Handlers Events 
*/
require('./events/handleHeader');
require('./events/getUserHosts');
require('./events/hostManager');

require('./events/explorerList');
require('./events/explorerConnect');


app.whenReady().then(() => ElectronRouter.init());