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
        if(!value.host.trim()) return cb({type: "addHost", error: true, message: "Invalid Address"});
        const uuid = md5(value.host+new Date().getTime());
        if(value.password.trim())
            keytar.setPassword(uuid, "default", value.password);
        delete value.password;
        create.file('profile/hosts/'+uuid+".json", JSON.stringify(value));
        cb({type: "addHost", uuid: uuid, host: value.host, port: value.port, username: value.username });
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
                callback.password = await keytar.getPassword(uuid, 'default');
            }
        }
        return callback;
    }

    async getAll(renew = false) {
        if(!hosts || renew) {
            await fs.readdir(project_path + "\\profile\\hosts", async (err, files) => {
                if (!err) {
                    for(let i = 0; i < files.length; i++) {
                        const uuid = files[i].split('.json')[0];
                        await create.read( "\\profile\\hosts\\"+files[i], async (data) => {
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