const Create = require('../doc');
const create = new Create();
const md5 = require('md5');

class Host {
    add(value, cb) {
        if(!value.host.trim()) return cb({type: "addHost", error: true, message: "Invalid Address"});
        const uuid = md5(value.host+new Date().getTime());
        create.file('profile/hosts/'+uuid+".json", JSON.stringify(value));
        create.getHosts(true);
        cb({type: "addHost", uuid: uuid, host: value.host, username: value.username });
    }
}


module.exports = Host;