const {ipcMain, shell} = require('electron');
const listener = require('../bin/Listeners/api');
const project_path = require('../bin/Class/userdata').path('profile');

const Account = require('../bin/Class/account.js');
const oauth = require('../bin/Class/oauth.js');
const WebSocket = require('websocket').client;

const Doc = require('./doc');
const doc = new Doc();

const fs = require("fs-extra");



let account;
let websocket;
let client;
let windows = null;


let api;
class Api {
    constructor() {
        this.oauth = oauth;
        api = this;

        this.account_onload = null;
        const files = doc.scandir('accounts');
        for(let i = 0; i < files.length; i++) {
            if(files[i] !== "default") {
                this.account_onload = new Account(files[0]);
            }
        }

        listener.define(api);
    }

    setWindows(wins) {
        windows = wins;
    }

    async synchronisation() {
        if(!account) return  await this.broadcast('profiler-sync', 0)
        await this.broadcast('profiler-sync', account.cache.sync);
    }

    async isSync() {
        await this.synchronisation();

        if(!account) return;
        if(!account.cache.passphrase) await windows.account.send('request-passphrase', true);
        if(account.cache['device-alert']) await windows.account.send('alert-system', profile.alertSystem);
    }

    async isReady(win_name) {
        if(win_name === "account") await this.isSync();
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
            oauth.configure(client, websocket, api);

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
                    if (json.type === "open") return this.account_load(this.account_onload);
                    if (json.type === "logout") return oauth.callback['logout'](json);
                    if (json.type === "user") return oauth.receive(json);
                    if (json.type.substring(0, 5) === "link-") {
                        if (json.type === "link-connect") return api.account_register(json.profile);
                        api.sendUI('account', 'profiler-account-' + json.type, json, true);
                    }

                }
            });

        });



    }

    sendData(message) {
        client.sendUTF(JSON.stringify(message))
    }

    sendUI(app, type, message, focus = false) {
        windows[app].send(type, message);
        if (focus) {
            windows[app].setAlwaysOnTop(true);
            windows[app].focus();
            windows[app].setAlwaysOnTop(false);
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
        oauth.setAccount(account);
        oauth.task_add(['get-settings', 'get-hosts', 'get-statuspass'])
        await oauth.get('get-profile');
    }

    async authentification(window = null) {
        if(!account) return;
        if (!windows || !windows[window]) return;
        windows[window].send('api:get-account', account.user)
    }

    async broadcast(type, message) {
        if (!windows) return;

        for (const [key, window] of Object.entries(windows)) {
            try {
                window.send(type, message);
            } catch (e) {
                delete windows[key];
            }
        }

    }

}
module.exports = Api;