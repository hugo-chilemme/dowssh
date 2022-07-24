const {ipcMain} = require('electron');
const fs = require("fs");
const project_path = require('./userdata').path('profile');

class Account {

    constructor(uuid) {

        if (!uuid || uuid.length !== 36) return;
        this.uuid = uuid;


        this.configure();
        if (!fs.existsSync(project_path + "/accounts/" + uuid + "/auths.json"))
            return null;


        console.log(uuid);
        this.user = this.get('profile');
        return this;
    }

    get(type) {
        if (!fs.existsSync(project_path + "/accounts/" + this.uuid + "/" + type + ".json")) return null;
        return JSON.parse(fs.readFileSync(project_path + '/accounts/' + this.uuid + "/" + type + ".json"));
    }

    set(type, data) {
        fs.writeFileSync(project_path + "/accounts/" + this.uuid + "/" + type + ".json", data);
        return this;
    }

    configure() {
        if (!fs.existsSync(project_path + "/accounts/" + this.uuid))
            fs.mkdirSync(project_path + "/accounts/" + this.uuid );
        if (!fs.existsSync(project_path + "/accounts/" + this.uuid+"/hosts"))
            fs.mkdirSync(project_path + "/accounts/" + this.uuid+"/hosts");
    }



    /* Use in General : new Account without argument is created */

    load(uuid) {
        if (!fs.existsSync(project_path + "/accounts/" + uuid)) return null;
        if (!fs.existsSync(project_path + "/accounts/" + uuid + "/auths.json")) return null;
        return fs.readFileSync('/accounts/' + uuid + "/auths.json")
    }

    create(type, json) {
        if (!json.uuid) return null;
        this.uuid = json.uuid;
        this.configure();
        fs.writeFileSync(project_path + "/accounts/" + json.uuid + "/" + type + ".json", JSON.stringify(json))
        return this;
    }


}

module.exports = Account;