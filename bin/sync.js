const Host = require('./Class/host');
const host = new Host();

let api;
let hosts;


class Sync {
    constructor(ApiIns) {
        api = ApiIns
    }

    async start() {
        hosts = this.get('hosts');
        setInterval(async () => {
            await this.haveModification();
        }, 2500);
    }

    async get(type) {
        if (type === "hosts") return await host.listObject();
    }


    async haveModification() {
        let changes = {hosts: {added: [], changed: [], deleted: [] } };
        const new_hosts = await host.listObject();
        for (const [key, value] of Object.entries(new_hosts)) {  // Added / Changed
            if (!hosts[value.uuid]) {
                changes.hosts.added.push(value.uuid);
            } else {
                for (const [host_key, host_value] of Object.entries(value))
                    if(!hosts[value.uuid] || host_value !== hosts[value.uuid][host_key] && !changes.hosts.changed.includes(value.uuid))
                        changes.hosts.changed.push(value.uuid);
            }
        }

        for (const [key, value] of Object.entries(hosts)) // Deleted
            if (!new_hosts[value.uuid])
                changes.hosts.deleted.push(value.uuid);



        for (const [key, value] of Object.entries(changes.hosts))
            if(value.length > 0)
                console.log(changes);


        hosts = new_hosts;
    }


}

module.exports = Sync;