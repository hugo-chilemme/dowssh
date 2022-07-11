const fs = require('fs-extra');
const project_path = process.cwd();

function formatBytes(a, b = 2, k = 1024) {
    with (Math) {
        let d = floor(log(a) / log(k));
        return 0 == a ? "0 Bytes" : parseFloat((a / pow(k, d)).toFixed(max(0, b))) + " " + ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][d]
    }
}

class Create {
    async folder(path, absolute = false) {
        if(!absolute) {
            if (await this.exist(path)) return false;
            fs.mkdirSync(project_path + "\\" + path, {recursive: true});
            return true;
        } else {
            if (await this.exist(path, true)) return false;
            fs.mkdirSync(path, {recursive: true});
            return true;
        }
    }

    async edit(path, contains) {
        await fs.writeFileSync(project_path + "\\" + path, contains);
    }

    async folders(obj) {
        for(let i = 0; i < obj.length; i++)
            await this.folder(obj[i]);
    }

    async file(path, data, absolute = false) {
        if(!absolute) {
            if (await this.exist(path)) return false;
            fs.writeFileSync(project_path + "\\" + path, data, {flag: 'a+'});
            return true;
        } else {
            if (await this.exist(path, true)) return false;
            fs.writeFileSync(path, data, {flag: 'a+'});
            return true;
        }
    }

    async exist(path, absolute = false) {
        if(!absolute) return fs.existsSync(project_path + "\\" + path);
        return fs.existsSync(path);
    }

    async stream(full_path) {
        return fs.createWriteStream(full_path);
    }

    async delete(path) {
        fs.unlinkSync(project_path + "\\" + path);
    }

    async scanDir(path) {
        return await fs.readdirSync(path, {withFileTypes: true});
    }

    async move(old_path, new_path) {
        fs.rename(process.cwd() + "\\" + old_path, process.cwd() + "\\" + new_path, function (err) {
            if (err) throw err
        })
    }

}

module.exports = Create;