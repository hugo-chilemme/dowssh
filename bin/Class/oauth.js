const {ipcMain, shell} = require("electron");
const notifier = require("node-notifier");
const os = require("os");
const md5 = require("md5");
const machineId = require('node-machine-id').machineId;


let vsync;
let hash_device;
const getHashMachine = async () => { hash_device = await machineId() };
getHashMachine();


let account;
let oauth = {tasks: []};

let api;
let client;
let websocket;


function newToken() {
    let result = '';
    for (let i = 0; i < 128; i++)
        result += "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".charAt(Math.floor(Math.random() * 36));
    return result;
}

const link = async (site) => {
    if (!vsync) vsync = newToken();
    const device = os.hostname();
    const user = os.userInfo();
    const platform = os.platform();
    const web = md5(site);
    api.sendData({type: "link", token: vsync, device: { name: device, os: platform, hash: hash_device, user_id: user.uid, user_name: user.username }, });
    await shell.openExternal(`https://api.hugochilemme.com/authorize?scope=${web}&vsync=${vsync}vdev=${md5(device)}`);
}

const configure = (cl, we, ap) => {
    client = cl;
    websocket = we;
    api = ap;
}

const setAccount = (acc) => {
    account = acc;
    if(acc.user) console.log(acc.user.email + "\tConnecting...")
    oauth.config = acc.get('auths');
}

const setToken = async (access_token) => {
    let acc = oauth.config;
    console.log(access_token);
    acc.access_token = access_token;
    oauth.config = acc;
    account.set('auths', JSON.stringify(acc));
}

const get = async (scope) => {
    if (!client || !websocket) return false;
    account.cache['sync'] = 3
    await api.synchronisation();
    client.sendUTF(JSON.stringify({type: 'user', scope: scope, session: oauth.config}));
}


const receive = async (obj) => {
    if (obj.message || obj.error) return console.log('Error ', obj.message, obj.error);
    if(obj.scope === "alert-system") return oauth.callback[obj.scope](obj);
    if (!obj.result.access_token) return console.log('Error access_token');
    await api.broadcast('profiler-sync', {type: 'get', data: obj.scope})
    await setToken(obj.result.access_token);

    if (obj.scope && oauth.callback[obj.scope])
        oauth.callback[obj.scope](obj.result.data);

    account.cache['sync'] = 2;
    await api.synchronisation();

    await api.broadcast(obj.scope, obj.result.data);
    if (oauth.tasks.length > 0)
        return get(oauth.tasks.shift());
    await api.broadcast('profiler-sync', false)
}


oauth.callback = {};
oauth.callback['get-settings'] = async (data) => {
    account.cache['settings'] = {};
    for (let i = 0; i < data.length; i++)
        account.cache['settings'][data[i].key] = data[i].value;
}
oauth.callback['get-statuspass'] = async (data) => {
    if (data) return account.cache['passphrase'] = true;
    account.cache['passphrase'] = false;
    ipcMain.emit('profiler-account');
    if(account.user) console.log(account.user.email + "\tRequesting input passphrase")
}
oauth.callback['get-profile'] = async (data) => {
    account.user = data;
    if(account.user)  console.log(account.user.email + "\tConnected")
    account.set('profile', JSON.stringify(account.user));
    await api.broadcast('api:get-account', account.user)
}
oauth.callback['set-passphrase'] = async (data) => {
    account.cache['sync'] = 1
    api.sendUI('account', 'set-passphrase-callback', true)
}
oauth.callback['alert-system'] = async (data) => {

    if(data['new-device']) {
        let regionNames = new Intl.DisplayNames([data['new-device'].country.toLowerCase()], {type: 'region'});
        console.log(data['new-device'])
        notifier.notify({
            title: 'Nouvel appareil détecté',
            message: data['new-device'].city + ", "+regionNames.of(data['new-device'].country) + " ("+data['new-device'].name+")",
            sticky: false,
            label: "Dowssh",
            sound: true,
            icon: "",
            appName: "Dowssh",
            a: 'Dowssh',
            contentImage: undefined,
        }, function () {
            ipcMain.emit('profiler-account');
            account.cache['device-alert'] = data;
        });

    }
}

// If your change that, the system can be automatically ban you
oauth.callback['logout'] = async () => {
    delete account;
    delete oauth.config;
    websocket = null;
    client = null;
    if(account.user) console.log(account.user.email + "\tLogout...")
    await api.synchronisation();
    await api.broadcast('api:get-account', {});
}

const task_add = (array) => {
    for (let i = 0; i < array.length; i++)
        oauth.tasks.push(array[i]);
}

exports.link = link;
exports.callback = oauth.callback;
exports.get = get;
exports.tasks = oauth.tasks;
exports.task_add = task_add;
exports.configure = configure;
exports.receive = receive;
exports.setAccount = setAccount;