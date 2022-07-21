require('update-electron-app')()

const main = require('./bin/main');
main.checkUpdate();
