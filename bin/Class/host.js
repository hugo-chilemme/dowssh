const Create = require('../doc');
const create = new Create();
const md5 = require('md5');
const fs = require('fs-extra')
const keytar = require('keytar')



const project_path = process.cwd();
const checkAddress = (str) => {
    return /^((\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$|^(([a-zA-Z]|[a-zA-Z][a-zA-Z\d\-]*[a-zA-Z\d])\.)*([A-Za-z]|[A-Za-z][A-Za-z\d\-]*[A-Za-z\d])$|^\s*((([\dA-Fa-f]{1,4}:){7}([\dA-Fa-f]{1,4}|:))|(([\dA-Fa-f]{1,4}:){6}(:[\dA-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([\dA-Fa-f]{1,4}:){5}(((:[\dA-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([\dA-Fa-f]{1,4}:){4}(((:[\dA-Fa-f]{1,4}){1,3})|((:[\dA-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([\dA-Fa-f]{1,4}:){3}(((:[\dA-Fa-f]{1,4}){1,4})|((:[\dA-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([\dA-Fa-f]{1,4}:){2}(((:[\dA-Fa-f]{1,4}){1,5})|((:[\dA-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([\dA-Fa-f]{1,4}:)(((:[\dA-Fa-f]{1,4}){1,6})|((:[\dA-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[\dA-Fa-f]{1,4}){1,7})|((:[\dA-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/.test(str);
}
let hosts = [];
class Host {

    async add(value, cb) {
        if (!checkAddress(value.host.trim())) return cb({type: "addHost", error: true, message: "Hôte invalide"});
        if (value.port < 0 || value.port > 65353) return cb({type: "addHost", error: true, message: "Port invalide"});
        const uuid = md5(value.host + new Date().getTime());

        if (value.password) await keytar.setPassword(uuid, "default", value.password);
        if (value.passphrase) await keytar.setPassword(uuid + "-passphrase", "default", value.passphrase);
        if (value.privatekey) await keytar.setPassword(uuid + "-privatekey", "default", value.privatekey);
        value.modification = new Date().getTime();

        delete value.password;
        delete value.privatekey;
        delete value.passphrase;
        await create.file('profile/hosts/' + uuid + ".json", JSON.stringify(value));


        cb({
            type: "addHost",
            uuid: uuid,
            host: value.host,
            port: value.port,
            username: value.username,
            name: value.name
        });
    }

    async get(uuid) {
        let callback = {};
        for (let i = 0; i < hosts.length; i++) {
            if (hosts[i].uuid === uuid) {
                callback = {
                    host: hosts[i].host,
                    uuid: hosts[i].uuid,
                    port: hosts[i].port,
                    username: hosts[i].username
                };
                if (hosts[i].name) callback.name = hosts[i].name;
                callback.password = await keytar.getPassword(uuid, 'default');
                callback.passphrase = await keytar.getPassword(uuid + "-passphrase", 'default');
                callback.privatekey = await keytar.getPassword(uuid + "-privatekey", 'default');
            }
        }
        return callback;


    }


    async list(cb) {
        hosts = [];
        const files = await fs.readdirSync(project_path + "/profile/hosts")
        for (let i = 0; i < files.length; i++) {
            try {
                const result = await create.read("/profile/hosts/" + files[i]);
                hosts.push(Object.assign({}, result, {uuid: files[i].split('.json')[0]}));
            } catch (e) {}
        }
        if(cb) cb(hosts);
        return hosts;
    }

    async listObject(cb) {
        let obj = {};
        const hosts = await this.list();
        for(let i = 0; i < hosts.length; i++)
            obj[hosts[i].uuid] = hosts[i];
        if(cb) cb(obj);
        return obj;
    }
}


module.exports = Host;