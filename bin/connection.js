const Create = require('./doc');
const Client = require('ssh2-sftp-client');

const { app, BrowserWindow, ipcMain, ipcRenderer} = require('electron');

const create = new Create();

const Host = require('./Class/host');
const host = new Host();




class Connection {

    constructor(window, connection, uuid) {
        this.window = window;
        this.options = { show_hidden_files: false, sort: 'ascending'};
        this.connection = { uuid: uuid, connection_id: connection };
        this.sftp = new Client();
        this.connect();
    }

    async sendClient(type, data) {
        let dt = data;
        dt.conn_id  = this.connection.connection_id;
        this.window.send(type, dt);
    }

    async action(type, data) {
        if(type === "list") return this.sftpList(data);
    }

    async sftpList(path) {
        let sending = [];
        const result = await this.sftp.list(`${path}`);
        for (const [key, value] of Object.entries(result)) {
            if (value.name.substring(0, 1) === "." && this.options.show_hidden_files) sending.push(value);
            else if(value.name.substring(0, 1) !== ".") sending.push(value);
        }
        sending.sort((a, b) => {
            if(a.type.charCodeAt(0) === b.type.charCodeAt(0)) {
                return a.name - b.name;
            }
            return a.type.charCodeAt(0) > b.type.charCodeAt(0) ? 1 : -1;

        })

        this.sendClient('profiler-sftp-list', {path: path, result: sending});
    }


    async connect() {
        try {
            const config = await host.get(this.connection.uuid);
            await this.sftp.connect({host: config.host, password: config.password, port: config.port, username: config.username, passphrase: config.passphrase});
            await this.sendClient('profiler-connect-status', {status: 1})
        } catch (e) {
            console.log(e)
            await this.sendClient('profiler-connect-status', {status: 3, error: "Invalid access"})
        }
    }

}

module.exports = Connection;



