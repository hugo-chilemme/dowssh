const fs = require('fs-extra');
const userData = require('./Class/userdata').path();
const project_path = require('./Class/userdata').path('profile');

class Create {
    constructor(props) {
        fs.mkdirSync(userData+"/dowssh", {recursive: true});
    }


    async folder(path, absolute = false, cb) {
        if (!absolute) {
            if (await this.exist(path)) return false;
            fs.mkdirSync(project_path + "/" + path, {recursive: true});
            if (cb) cb(true)
            return true;
        } else {
            if (await this.exist(path, true)) return false;
            fs.mkdirSync(path, {recursive: true});
            if (cb) cb(true)
            return true;
        }
    }

    async edit(path, contains) {
        await fs.writeFileSync(project_path + "/" + path, contains);
    }

    async folders(obj) {
        for (let i = 0; i < obj.length; i++) {
            await this.folder(obj[i], false);
        }
    }

    async file(path, data, cb = null) {

        if (await this.exist(project_path + path, true)) return false;
        fs.writeFileSync(project_path  + path, data, {flag: 'a+'});
        if (cb) cb(path)
        return true;

    }

    async exist(path, absolute = false) {
        if (!absolute) return fs.existsSync(project_path + "/" + path);
        return fs.existsSync(path);
    }


    async delete(path) {
        fs.unlinkSync(project_path + "/" + path);
    }

    read(path) {
        return JSON.parse(fs.readFileSync(project_path + path, {encoding: 'utf8', flag: 'r'}));
    }


    async move(old_path, new_path) {
        fs.rename(project_path +'/'+ old_path, project_path +'/'+ new_path, function (err) {
            if (err) throw err
        })
    }

}

module.exports = Create;