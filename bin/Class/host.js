const Create = require('../doc');
const create = new Create();
const md5 = require('md5');
const keytar = require('keytar')
const fs = require("fs-extra");
const project_path = process.cwd();

let hosts = [];

class Host {
    constructor() {
        this.getAll(true);
    }

    add(value, cb) {
        if(!value.host.trim()) return cb({type: "addHost", error: true, message: "Adresse IP invalide"});
        const uuid = md5(value.host+new Date().getTime());
        if(value.password)
            keytar.setPassword(uuid, "default", value.password);
        if(value.passphrase)
            keytar.setPassword(uuid+"-passphrase", "default", value.passphrase);
        if(value.privatekey)
            keytar.setPassword(uuid+"-privatekey", "default", value.privatekey);
        delete value.password;
        delete value.privatekey;
        delete value.passphrase;
        create.file('profile/hosts/'+uuid+".json", JSON.stringify(value));
        cb({type: "addHost", uuid: uuid, host: value.host, port: value.port, username: value.username, name: value.name });
        setTimeout(() => {
            this.getAll(true);
        }, 1000)
    }

    async get(uuid) {
        let datas = await this.getAll();
        let callback = {};
        for(let i =0; i < datas.length; i++) {
            if(datas[i].uuid === uuid) {
                callback = {
                    host: datas[i].host,
                    uuid: datas[i].uuid,
                    port: datas[i].port,
                    username: datas[i].username
                };
                console.log(datas[i])
                if(datas[i].name) callback.name = datas[i].name;
                callback.password = await keytar.getPassword(uuid, 'default');
                callback.passphrase = await keytar.getPassword(uuid+"-passphrase", 'default');
                callback.privatekey = await keytar.getPassword(uuid+"-privatekey", 'default');
            }
        }
        return callback;
    }

    async getAll(renew = false) {
        if(!hosts || renew) {
            await fs.readdir(project_path + "/profile/hosts", async (err, files) => {
                if (!err) {
                    for(let i = 0; i < files.length; i++) {
                        const uuid = files[i].split('.json')[0];
                        await create.read( "/profile/hosts/"+files[i], async (data) => {
                            hosts.push(Object.assign({}, data, {uuid: uuid}));
                        })
                    }
                }
            })
        } else {
            return hosts;
        }
    }
}


module.exports = Host;