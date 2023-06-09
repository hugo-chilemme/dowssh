const SFTPConnector = require('./libs/SFTPConnector');
const SessionStorage = require('./libs/SessionStorage');
const ElectronEngine = require('./libs/ElectronEngine');
try {
    require('electron-reloader')(module)
} catch (_) {}