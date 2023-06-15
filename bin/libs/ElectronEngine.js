const { app } = require('electron');
const ElectronRouter = require('./ElectronRouter');
/*
    Loading Handlers Events 
*/
require('./events/handleHeader');
require('./events/getUserHosts');
require('./events/hostManager');

require('./events/explorerList');
require('./events/explorerConnect');
require('./events/explorerUpload');
require('./events/explorerOpenFile');
require('./events/explorerDeleteFile');
require('./events/explorerRenameFile');


app.whenReady().then(() => ElectronRouter.init());