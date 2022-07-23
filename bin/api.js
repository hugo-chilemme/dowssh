const {ipcMain, shell} = require('electron');
const listener = require('../bin/Listeners/api');


const md5 = require('md5');
const WebSocket = require('websocket').client;
const Create = require('./doc');
const create = new Create();
// Only used for devices list in your account profile
const os = require('os');
const fs = require("fs-extra");
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
    sync: { status: 0, error: null }
}
let windows = null;


let api;
class Api {

    constructor() {
        listener.define(this);
        api = this;
    }

    setWindows(wins) {
        windows = wins;
    }

    async synchronisation() {
        await broadcast('profiler-sync', profile.sync);
    }

    async isSync() {
        if (profile.user && profile.sync.error === 'passphrase') {
            await windows.account.send('request-passphrase', true);
        }
    }

    async isReady(win_name) {
        if(win_name === "account") await this.isSync();
        await this.synchronisation();
    }

    async tryAuthentification() {
        const waitReady = async () => {
            const files = await fs.readdirSync(process.cwd() + "/profile/accounts");
            if (files.length > 0) {
                const account = await create.read("profile/accounts/" + files[0]);
                if (client) await this.account_load(account.uuid);
                else setTimeout(() => waitReady(), 1000)
            }
        }
        await waitReady();
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
            console.log('connect');
            await this.tryAuthentification();


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


    sendUI(type, message, focus = false) {
        windows.account.send(type, message);
        if (focus) {
            windows.account.setAlwaysOnTop(true);
            windows.account.focus();
            windows.account.setAlwaysOnTop(false);
        }
    }

    async account_register(data) {
        await create.file('profile/accounts/' + data.uuid + ".json", JSON.stringify({
            uuid: data.uuid,
            device: data.device,
            access_token: data.access_token
        }))
        await this.account_load(data.uuid);
    }

    async account_load(uuid) {

        const account = await create.read('profile/accounts/' + uuid + ".json");
        if (!account) return;
        oauth.tasks.length = 0;
        oauth.configure(account);
        oauth.task_add(['get-settings', 'get-hosts', 'get-statuspass'])
        await oauth.get('get-profile');
    }

    async link(site) {
        if (!vsync) vsync = newToken();
        const device = os.hostname();
        const webhash = md5(site);
        sendData({type: "link", token: vsync, device: device});
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
oauth.configure = (account) => {
    oauth.config = account;
}
oauth.setToken = async (access_token) => {
    let account = oauth.config;
    account.access_token = access_token;
    oauth.config = account;
    await create.edit('profile/accounts/' + oauth.config.uuid + ".json", JSON.stringify(account))
}

oauth.get = async (scope) => {
    if (!client || !websocket) return false;
    profile.sync = {status: 2, error: null};
    await api.synchronisation();
    client.sendUTF(JSON.stringify({type: 'user', scope: scope, session: oauth.config}));
}

oauth.receive = async (obj) => {
    if (obj.message || obj.error) return console.log('Error ', obj.message, obj.error);
    if (!obj.result.access_token) return create.delete('profile/accounts/' + oauth.config.uuid + ".json");

    console.log(obj)

    await broadcast('profiler-sync', {type: 'get', data: obj.scope})
    await oauth.setToken(obj.result.access_token);

    if (obj.scope && oauth.callback[obj.scope])
        oauth.callback[obj.scope](obj.result.data);

    profile.sync = {status: 1, error: null};
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
    if (data) return profile.sync = {status: 2, error: null};
    ipcMain.emit('profiler-account');
    return profile.sync = {status: 0, error: 'passphrase'};

}
oauth.callback['get-profile'] = async (data) => {
    profile.user = data;
    await broadcast('api:get-account', profile.user)
}
oauth.callback['set-passphrase'] = async (data) => {
    windows.account.send('set-passphrase-callback', data.success);
}
// If your change that, the system can be automatically ban you
oauth.callback['logout'] = async () => {
    await create.delete('profile/accounts/' + oauth.config.uuid + ".json");
    profile = { user: null, settings: null, hosts: null, sync: {status: 0, error: null}};
    delete oauth.config;
    websocket = null;
    client = null;
    await api.synchronisation();
    await broadcast('api:get-account', profile.user);
}

oauth.task_add = (array) => {
    for (let i = 0; i < array.length; i++)
        oauth.tasks.push(array[i]);
}






module.exports = Api;