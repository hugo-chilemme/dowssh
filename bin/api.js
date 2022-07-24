const {ipcMain, shell} = require('electron');
const listener = require('../bin/Listeners/api');
const project_path = require('../bin/Class/userdata').path('profile');

const Account = require('../bin/Class/account.js');
let account;
const notifier = require('node-notifier');

const md5 = require('md5');
const WebSocket = require('websocket').client;
const Create = require('./doc');
const create = new Create();
// Only used for devices list in your account profile
const os = require('os');
const fs = require("fs-extra");

const machineId = require('node-machine-id').machineId;

let hash_device;
const getHashMachine = async () => { hash_device = await machineId() };
getHashMachine()
//


let websocket;
let client;
let vsync;

function newToken() {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < 128; i++)
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    return result;
}

let profile = {
    user: null,
    settings: null,
    hosts: null,
    passphrase: false,
    sync: 0
}
let windows = null;


let api;
class Api {

    constructor() {
        this.oauth = oauth;
        listener.define(this);
        api = this;

        this.account_onload = null;
        const files = fs.readdirSync(project_path + "/accounts");
        for(let i = 0; i < files.length; i++) {
            if(files[i] !== "default") {
                this.account_onload = new Account(files[0]);
            }
        }
    }

    setWindows(wins) {
        windows = wins;
    }

    async synchronisation() {
        console.log(profile.sync)
        await broadcast('profiler-sync', profile.sync);
    }

    async isSync() {
        await this.synchronisation();
        if(!account) return;
        if(!profile.passphrase) await windows.account.send('request-passphrase', true);
        if(profile.alertSystem) await windows.account.send('alert-system', profile.alertSystem);
    }

    async isReady(win_name) {
        if(win_name === "account") await this.isSync();
        if(win_name === "application" && this.account_onload) await this.account_load(this.account_onload);
        await this.synchronisation();
    }




    async connect() {
        if (websocket) {
            websocket = null;
            client = null;
        }
        websocket = new WebSocket(null);
        websocket.connect('wss://api.hugochilemme.com/v1/profile');
        const connect = () => this.connect();

        websocket.on('connect', async (connection) => {
            client = connection;

            setInterval(() => {
                if(client) this.sendData({present: true})
            }, 5000)
            connection.on('error', async () => {
                websocket = null;
                setTimeout(() => {
                    connect();
                }, 10000)
            });
            connection.on('close',  async() => {
                websocket = null;
                setTimeout(() => {
                    connect();
                }, 10000)
            });
            
            connection.on('message', async (message) => {
                if (message.type === 'utf8') {
                    let json = JSON.parse(message.utf8Data);
                    if (!json.type) return;
                    if (json.type === "logout") return oauth.callback['logout'](json);
                    if (json.type === "user") return oauth.receive(json);
                    if (json.type.substring(0, 5) === "link-") {
                        if (json.type === "link-connect") return account_register(json.profile);
                        sendUI('profiler-account-' + json.type, json, true);
                    }

                }
            });


        });

        const sendUI = (type, json, focus = false) => {
            this.sendUI(type, json, focus)
        }
        const account_register = (json) => {
            this.account_register(json)
        }


    }

    sendData(message) {
        client.sendUTF(JSON.stringify(message))
    }
    sendUI(type, message, focus = false) {
        windows.account.send(type, message);
        if (focus) {
            windows.account.setAlwaysOnTop(true);
            windows.account.focus();
            windows.account.setAlwaysOnTop(false);
        }
    }

    async account_register(data) {
        let acc = new Account(data.uuid);
        acc.set('auths', JSON.stringify({
            uuid: data.uuid,
            device: data.device,
            access_token: data.access_token
        }))
        await this.account_load(acc);
    }


    async account_load(acc) {
        if(!acc) return;
        account = acc;
        oauth.tasks.length = 0;
        oauth.configure();
        oauth.task_add(['get-settings', 'get-hosts', 'get-statuspass'])
        await oauth.get('get-profile');
    }

    async link(site) {
        if (!vsync) vsync = newToken();
        const device = os.hostname();
        const user = os.userInfo();
        const webhash = md5(site);
        sendData({type: "link", token: vsync, device: { name: device, hash: hash_device, user_id: user.uid, user_name: user.username }, });
        await shell.openExternal("https://api.hugochilemme.com/authorize?scope=" + webhash + "&vsync=" + vsync + "&vdev=" + md5(device));
    }

    async authentification(window = null) {
        if (!windows || !windows[window]) return;
        windows[window].send('api:get-account', profile.user)
    }
}




const sendData = (message) => client.sendUTF(JSON.stringify(message));


const broadcast = async (type, message) => {
    if (!windows) return;

    for (const [key, window] of Object.entries(windows)) {
        try {
            window.send(type, message);
        } catch (e) {
            delete windows[key];
        }
    }

}




let oauth = {tasks: []};
oauth.configure = () => {
    if(account.user) console.log(account.user.email + "\tConnecting...")
    oauth.config = account.get('auths');
}
oauth.setToken = async (access_token) => {
    let acc = oauth.config;
    acc.access_token = access_token;
    oauth.config = acc;
    account.set('auths', JSON.stringify(acc));
}

oauth.get = async (scope) => {
    if (!client || !websocket) return false;
    profile.sync = 3;
    await api.synchronisation();
    client.sendUTF(JSON.stringify({type: 'user', scope: scope, session: oauth.config}));
}

oauth.receive = async (obj) => {
    if (obj.message || obj.error) return console.log('Error ', obj.message, obj.error);
    if(obj.scope === "alert-system") return oauth.callback[obj.scope](obj);
    if (!obj.result.access_token) return console.log('Error access_token');

    await broadcast('profiler-sync', {type: 'get', data: obj.scope})
    await oauth.setToken(obj.result.access_token);

    if (obj.scope && oauth.callback[obj.scope])
        oauth.callback[obj.scope](obj.result.data);

    profile.sync = 2;
    await api.synchronisation();

    await broadcast(obj.scope, obj.result.data);
    if (oauth.tasks.length > 0)
        return oauth.get(oauth.tasks.shift());
    await broadcast('profiler-sync', false)
}

oauth.callback = {};
oauth.callback['get-settings'] = async (data) => {
    for (let i = 0; i < data.length; i++)
        profile.settings[data[i].key] = data[i].value;
}
oauth.callback['get-statuspass'] = async (data) => {
    if (data) return profile.passphrase = true;
    profile.passphrase = false;
    ipcMain.emit('profiler-account');
    if(account.user) console.log(account.user.email + "\tRequesting input passphrase")
}
oauth.callback['get-profile'] = async (data) => {
    profile.user = data;
    if(account.user)  console.log(account.user.email + "\tConnected")
    account.set('profile', JSON.stringify(profile.user));
    await broadcast('api:get-account', profile.user)
}
oauth.callback['set-passphrase'] = async (data) => {
    profile.sync = 1;
    windows.account.send('set-passphrase-callback', true);
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
            profile.alertSystem = data;
        });

    }
}


// If your change that, the system can be automatically ban you
oauth.callback['logout'] = async () => {
    profile = { user: null, settings: null, hosts: null, sync: 0 };
    delete oauth.config;
    websocket = null;
    client = null;
    if(account.user) console.log(account.user.email + "\tLogout...")
    await api.synchronisation();
    await broadcast('api:get-account', profile.user);
}

oauth.task_add = (array) => {
    for (let i = 0; i < array.length; i++)
        oauth.tasks.push(array[i]);
}






module.exports = Api;