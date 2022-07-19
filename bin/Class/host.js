const Create = require('../doc');
const create = new Create();
const md5 = require('md5');
const keytar = require('keytar')
const fs = require("fs-extra");
const {Client} = require('ssh2');

const project_path = process.cwd();
const checkAddress = (str) => {
    return /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$|^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$|^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/.test(str);
}
let hosts = [];

class Host {

    add(value, cb) {
        if (!checkAddress(value.host.trim())) return cb({type: "addHost", error: true, message: "Hôte invalide"});
        if (value.port < 0 || value.port > 65353) return cb({type: "addHost", error: true, message: "Port invalide"});
        const uuid = md5(value.host + new Date().getTime());

        if (value.password)
            keytar.setPassword(uuid, "default", value.password);
        if (value.passphrase)
            keytar.setPassword(uuid + "-passphrase", "default", value.passphrase);
        if (value.privatekey)
            keytar.setPassword(uuid + "-privatekey", "default", value.privatekey);
        delete value.password;
        delete value.privatekey;
        delete value.passphrase;
        create.file('profile/hosts/' + uuid + ".json", JSON.stringify(value));
        cb({
            type: "addHost",
            uuid: uuid,
            host: value.host,
            port: value.port,
            username: value.username,
            name: value.name
        });
        setTimeout(() => {
            this.getAll(true);
        }, 1000)
    }

    async get(uuid) {
        let datas = await this.getAll();
        let callback = {};
        for (let i = 0; i < datas.length; i++) {
            if (datas[i].uuid === uuid) {
                callback = {
                    host: datas[i].host,
                    uuid: datas[i].uuid,
                    port: datas[i].port,
                    username: datas[i].username
                };
                console.log(datas[i])
                if (datas[i].name) callback.name = datas[i].name;
                callback.password = await keytar.getPassword(uuid, 'default');
                callback.passphrase = await keytar.getPassword(uuid + "-passphrase", 'default');
                callback.privatekey = await keytar.getPassword(uuid + "-privatekey", 'default');
            }
        }
        return callback;
    }


    async list(cb) {
        hosts = [];
        await fs.readdir(project_path + "/profile/hosts", async (err, files) => {
            if (err) return console.error(err);
            for (let i = 0; i < files.length; i++) {
                const result = await create.read("/profile/hosts/" + files[i]);
                hosts.push(Object.assign({}, result, {uuid: files[i].split('.json')[0]}));
            }
            cb(hosts);
        });

    }
}


module.exports = Host;