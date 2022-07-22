const {app, BrowserWindow, ipcMain, ipcRenderer, shell} = require('electron');
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
let sync = {status: false}

function newToken() {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 128; i++)
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    return result;
}

let profile = {
    user: null,
    settings: null,
    hosts: null,
}
let win_app = null;
let windows = null;

class Api {
    setWin(win) {
        win_app = win;
        console.log('Api: Windows receive');
        win_app.focus();

    }

    setBroadcast(wins) {
        windows = wins;
        console.log('Windows Broadcast receive');
    }

    async tryAuthentification() {
        const waitReady = async () => {
            const files = await fs.readdirSync(process.cwd() + "/profile/accounts")
            if (files.length > 0) {
                const account = await create.read("profile/accounts/" + files[0]);
                if (client) this.account_load(account.uuid);
                else setTimeout(() => waitReady(), 2500)
            }
        }
        waitReady();
    }
    async synchronisation() {
        if(!profile.user) return;
        await broadcast('profiler-sync', sync.status);
    }
    async connect(uuid = false) {
        if (websocket) {
            websocket = null;
            client = null;
        }
        websocket = new WebSocket();
        const connect = () => this.connect();

        websocket.on('connect', function (connection) {
            client = connection;
            console.log('connect');


            connection.on('error', function (error) {
                websocket = null;
                setTimeout(() => {
                    connect();
                }, 10000)
            });
            connection.on('close', function () {
                websocket = null;
                setTimeout(() => {
                    connect();
                }, 10000)
            });

            const api = this;
            connection.on('message', async (message) => {
                if (message.type === 'utf8') {
                    let json = JSON.parse(message.utf8Data);
                    if (!json.type) return;
                    if (json.type === "user-get") return oauth.receive(json);
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


        websocket.connect('wss://api.hugochilemme.com/v1/profile');
    }

    sendData(message) {
        client.sendUTF(JSON.stringify(message));
    }

    sendUI(type, message, focus = false) {
        win_app.send(type, message);
        if (focus) {
            win_app.setAlwaysOnTop(true);
            win_app.focus();
            win_app.setAlwaysOnTop(false);
        }
    }

    async account_register(data) {
        await create.file('profile/accounts/' + data.uuid + ".json", JSON.stringify({
            uuid: data.uuid,
            device: data.device,
            access_token: data.access_token
        }))
        this.account_load(data.uuid);
    }

    async account_load(uuid) {

        const account = await create.read('profile/accounts/' + uuid + ".json");
        if (!account) return;
        oauth.tasks.length = 0;
        oauth.configure(account);
        oauth.task_add(['get-settings', 'get-hosts'])
        oauth.get('get-profile');
    }

    async link(site) {
        if (!vsync) vsync = newToken();
        const device = os.hostname();
        const webhash = md5(site);
        this.sendData({type: "link", token: vsync, device: device});
        shell.openExternal("https://api.hugochilemme.com/authorize?scope=" + webhash + "&vsync=" + vsync + "&vdev=" + md5(device));
    }

    async authentification(window = null) {
        if (!window) return;
        window.send('profiler-authentification-callback', profile.user)
    }


    async sync(status = false) {
        await this.broadcast('profiler-sync', status);
    }


}

const broadcast = async (type, message) => {
    if (!windows) return;
    if(type === "profiler-sync") sync.status = message;

    for (const [key, window] of Object.entries(windows))
        if (window) window.send(type, message);
}


let oauth = {scopes: ['get-profile', 'get-settings', 'get-hosts'], tasks: []};
oauth.configure = (account) => {
    oauth.config = account;
}

oauth.get = (scope) => {
    if (!client || !websocket) return false;
    client.sendUTF(JSON.stringify({type: 'user-get', scope: scope, session: oauth.config}));
}

oauth.receive = async (obj) => {
    if (!oauth.scopes.includes(obj.scope)) return console.log(obj.scope + " not found");
    let account = oauth.config;

    await broadcast('profiler-sync', oauth.scopes)
    if (obj.message) return create.delete('profile/accounts/' + oauth.config.uuid + ".json");
    account.access_token = obj.result.access_token;
    oauth.config = account;

    await create.edit('profile/accounts/' + oauth.config.uuid + ".json", JSON.stringify(account))
    if (obj.scope === "get-settings") {

        const settings_brut = obj.result.data;
        for (let i = 0; i < settings_brut.length; i++) {
            profile.settings[settings_brut.key] = settings.value;
        }
    }
    if (obj.scope === "get-profile") {
        profile.user = obj.result.data;
        await broadcast('profiler-authentification-callback', profile.user)

    }
    ;
    if (win_app) {
        console.log(obj.result.data)
        win_app.send(obj.scope, obj.result.data);
    }
    if (oauth.tasks.length > 0) setTimeout(() => oauth.task_start(), 5000);
    else await broadcast('profiler-sync', false)
}
oauth.task_start = () => {
    let scope = oauth.tasks.shift();
    oauth.get(scope);
}
oauth.task_add = (array) => {
    for (let i = 0; i < array.length; i++)
        oauth.tasks.push(array[i]);
}


module.exports = Api;