const {app, BrowserWindow, ipcMain, ipcRenderer, shell} = require('electron');
const md5 = require('md5');
const fs = require("fs");
const WebSocket = require('websocket').client;
let websocket;
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
            console.log('connected');

            connection.on('error', function(error) {
                websocket = null;
                console.error('closed');
            });
            connection.on('close', function() {
                websocket = null;
                console.error('closed');
            });
            connection.on('message', function(message) {
                if (message.type === 'utf8') {
                    let json = JSON.parse(message.utf8Data);
                    console.log(json);
                    if(json.type === "open") return sendToken(site);
                    if(json.type === "link-receive") return sendUI('profiler-account-link', json, true);
                }
            });

            const sendUI = (type, message, focus = false) => {
                win_app.send(type, message);
                if(focus) win_app.focus();
            }

            const sendData = (message) => {
                connection.sendUTF(JSON.stringify(message));
            }

            const sendToken = (site) => {
                if(!vsync) vsync = newToken();
                const webhash = md5(site);
                sendData({type: "link", token: vsync});
                console.log("https://api.hugochilemme.com/authorize?scope="+webhash+"&vsync="+vsync)
                shell.openExternal("https://api.hugochilemme.com/authorize?scope="+webhash+"&vsync="+vsync);
            }
        });
        websocket.connect('wss://api.hugochilemme.com/v1/profile');






    }


}

module.exports = Api;