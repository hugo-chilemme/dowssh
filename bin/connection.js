const Create = require('./doc');
const sshpk = require('sshpk');
const keytar = require('keytar');
const Client = require('ssh2-sftp-client');
const {app, BrowserWindow, ipcMain, ipcRenderer} = require('electron');

const create = new Create();

const Host = require('./Class/host');
const host = new Host();


class Connection {

    constructor(window, connection, uuid) {
        this.window = window;
        this.sftp = new Client();
        this.destroyed = false;
        this.options = {show_hidden_files: false, sort: 'ascending'};
        this.connection = {uuid: uuid, connection_id: connection};
        this.connect();
    }

    async sendClient(type, data) {
        let dt = data;
        dt.conn_id = this.connection.connection_id;
        this.window.send(type, dt);
    }

    async action(type, data) {
        if (type === "list") return this.sftpList(data);
    }

    async sftpList(path) {
        let sending = [];
        const result = await this.sftp.list(`${path}`);
        for (const [key, value] of Object.entries(result)) {
            if (value.name.substring(0, 1) === "." && this.options.show_hidden_files) sending.push(value);
            else if (value.name.substring(0, 1) !== ".") sending.push(value);
        }
        console.log(sending)
        sending.sort((a, b) => {
            if (a.type.charCodeAt(0) === b.type.charCodeAt(0)) {
                return a.name - b.name;
            }
            return a.type.charCodeAt(0) > b.type.charCodeAt(0) ? 1 : -1;

        })

        this.sendClient('profiler-sftp-list', {path: path, result: sending});
    }



    async connect() {
        let returned = false;
        try {

            const config = await host.get(this.connection.uuid);
            if(config.privatekey && config.privatekey.includes('PuTTY')) {
                let key = sshpk.parsePrivateKey(config.privatekey, 'putty');
                let openssh = key.toString('openssh');
                keytar.setPassword(this.connection.uuid+"-privatekey", "default", openssh);
                config.privatekey = openssh;
            }

            await this.sftp.connect({
                host: config.host,
                password: config.password,
                port: config.port,
                username: config.username,
                passphrase: config.passphrase,
                privateKey: config.privatekey,

                debug: (e) => {
                    console.log('>> '+e)
                    if(e.includes('publickey auth failed')) {
                        this.sendClient('profiler-connect-status', {status: 3, error: "L'hôte à refusé la publickey "})
                        returned = true;
                        this.destroyed = true
                    }
                    if(e.includes('ERR_BAD_AUTH')) {
                        this.sendClient('profiler-connect-status', {status: 3, error: "L'authentification a échoué"})
                        returned = true;
                        this.destroyed = true
                    }

                }
            });
            console.log('Connected');
            await this.sendClient('profiler-connect-status', {status: 1})
            returned = true
        } catch (e) {
            console.log(e)
            if(!returned)
            await this.sendClient('profiler-connect-status', {status: 3, error: "Aucune réponse de l'hôte"})
            this.destroyed = true
        }
    }

}

module.exports = Connection;



