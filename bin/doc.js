const fs = require('fs-extra');
const project_path = process.cwd();

class Create {
    async folder(path, absolute = false, cb) {
        if(!absolute) {
            if (await this.exist(path)) return false;
            fs.mkdirSync(project_path + "/" + path, {recursive: true});
            if(cb) cb(true)
            return true;
        } else {
            if (await this.exist(path, true)) return false;
            fs.mkdirSync(path, {recursive: true});
            if(cb) cb(true)
            return true;
        }
    }

    async edit(path, contains) {
        await fs.writeFileSync(project_path + "/" + path, contains);
    }

    async folders(obj) {
        for(let i = 0; i < obj.length; i++) {
            await this.folder(obj[i], false);
        }
    }

    async file(path, data, absolute = false, cb = null) {
        if(!absolute) {
            if (await this.exist(path)) return false;
            fs.writeFileSync(project_path + "/" + path, data, {flag: 'a+'});
            if(cb) cb(path)
            return true;
        } else {
            if (await this.exist(path, true)) return false;
            fs.writeFileSync(path, data, {flag: 'a+'});
            if(cb) cb(path)
            return true;
        }
    }

    async exist(path, absolute = false) {
        if(!absolute) return fs.existsSync(project_path + "/" + path);
        return fs.existsSync(path);
    }



    async delete(path) {
        fs.unlinkSync(project_path + "/" + path);
    }

    read(path) {
        return JSON.parse(fs.readFileSync(project_path + "/" + path, {encoding:'utf8', flag:'r'}));
    }


    async move(old_path, new_path) {
        fs.rename(process.cwd() + "/" + old_path, process.cwd() + "/" + new_path, function (err) {
            if (err) throw err
        })
    }

}

module.exports = Create;