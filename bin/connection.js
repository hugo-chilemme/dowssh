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
        this.options = {show_hidden_files: false, sort: 'ascending'};
        this.connection = {uuid: uuid, connection_id: connection, destroyed:false, sftp: new Client() };
        this.connect();
    }

    async sendClient(type, data) {
        this.window.send(type, {...data, ...{conn_id: this.connection.connection_id}});
    }

    async action(type, data) {
        if (type === "list") return this.sftpList(data);
    }

    async sftpList(path) {
        let sending = [];
        for (const [key, value] of Object.entries(await this.connection.sftp.list(path))) {
            if (value.name.substring(0, 1) === "." && this.options.show_hidden_files) sending.push(value);
            else if (value.name.substring(0, 1) !== ".") sending.push(value);
        }
        sending.sort((a, b) => {
            if (a.type.charCodeAt(0) === b.type.charCodeAt(0))
                return a.name - b.name;
            return a.type.charCodeAt(0) > b.type.charCodeAt(0) ? 1 : -1;
        })
        this.sendClient('profiler-sftp-list', {path: path, result: sending});
    }



    async connect() {
        // try {
            const config = await host.get(this.connection.uuid);
            if(config.privatekey && config.privatekey.includes('PuTTY')) {
                let openssh = sshpk.parsePrivateKey(config.privatekey, 'putty').toString('openssh');
                keytar.setPassword(this.connection.uuid+"-privatekey", "default", openssh);
                config.privatekey = openssh;
            }

            await this.connection.sftp.connect({
                host: config.host,
                password: config.password,
                port: config.port,
                username: config.username,
                passphrase: config.passphrase,
                privateKey: config.privatekey,

                debug: (e) => {
                    console.log(e)
                    if(e.includes('publickey auth failed')) {
                        this.sendClient('profiler-connect-status', {status: 3, error: "L'hôte à refusé la publickey "})
                        this.connection.destroyed = true
                    }
                    if(e.includes('ERR_BAD_AUTH')) {
                        this.sendClient('profiler-connect-status', {status: 3, error: "L'authentification a échoué"})
                        this.connection.destroyed = true
                    }

                }
            });
            await this.sendClient('profiler-connect-status', {status: 1})

            // if(!this.connection.destroyed)
            //     await this.sendClient('profiler-connect-status', {status: 3, error: "Aucune réponse de l'hôte"})
            // this.connection.destroyed = true

    }

}

module.exports = Connection;



