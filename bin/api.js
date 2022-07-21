const {app, BrowserWindow, ipcMain, ipcRenderer, shell} = require('electron');
const md5 = require('md5');
const fs = require("fs");
const WebSocket = require('websocket').client;
const store = require('data-store')({ path: process.cwd() + '/profile/account.json' });

// Only used for devices list in your account profile
const os = require('os');
//



let websocket;
let client;
let vsync;

function newToken() {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 128; i++)
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    return result;
}

let win_app = null;
class Api {
    setWin(win) {
        win_app = win;
        console.log('Api: Windows receive');
        win_app.focus();
    }
    connect(site) {
        if(websocket) return sendToken(site);
        websocket = new WebSocket();

        websocket.on('connect', function(connection) {
            client = connection;
            // Keep Connection
            setInterval(() => sendData( {type: "active", active: true}), 28000);
            //

            connection.on('error', function(error) {
                websocket = null;
                console.error('closed');
            });
            connection.on('close', function() {
                websocket = null;
                console.error('closed');
            });
            connection.on('message', async (message) => {
                if (message.type === 'utf8') {
                    let json = JSON.parse(message.utf8Data);
                    if(!json.type) return;
                    if(json.type === "user-get") return oauth.receive(json);
                    if(json.type === "open") sendToken(site);
                    if(json.type.substring(0, 5) === "link-") sendUI('profiler-account-'+json.type, json, true);
                    if(json.type === "link-connect") account_register(json.profile);
                }
            });

            const sendUI = async (type, message, focus = false) => {
                win_app.send(type, message);
                if(focus) {
                    win_app.setAlwaysOnTop(true);
                    win_app.focus();
                    win_app.setAlwaysOnTop(false);
                }
            }

            const sendData = async (message) => {
                client.sendUTF(JSON.stringify(message));
            }


            const sendToken = async (site) => {
                if(!vsync) vsync = newToken();
                const device = os.hostname();
                const webhash = md5(site);
                sendData({type: "link", token: vsync, device: device});
                shell.openExternal("https://api.hugochilemme.com/authorize?scope="+webhash+"&vsync="+vsync+"&vdev="+md5(device));
            }

            const account_register =  (data) => {
                store.set(data.uuid, {uuid: data.uuid, device: data.device, access_token: data.access_token});
                account_load(data.uuid);
            }

            const account_load = async(uuid) => {
                const account = store.get(uuid);
                if(!account) return;
                oauth.configure(account);
                oauth.get('get-profile');

            }
        });
        websocket.connect('wss://api.hugochilemme.com/v1/profile');
    }




}
let oauth = { scopes: [ 'get-profile']};
oauth.configure = (account) => {
    oauth.config = account;
}
oauth.get = (scope, callback) => {
    if(!client || !websocket) return false;
    client.sendUTF(JSON.stringify({type: 'user-get', scope: scope, session: oauth.config}));
}
oauth.receive = (obj) => {
    if(!oauth.scopes.includes(obj.scope)) return console.log(obj.scope + " not found");
    store.set(oauth.config.uuid, Object.assign({}, store.get(oauth.config.uuid), {access_token: obj.access_token}));
    win_app.send(obj.scope, obj.result.data);
}


module.exports = Api;