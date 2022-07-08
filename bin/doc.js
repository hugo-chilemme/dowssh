const fs = require('fs');
const project_path = process.cwd();
function formatBytes(a, b = 2, k = 1024) {
    with (Math) {
        let d = floor(log(a) / log(k));
        return 0 == a ? "0 Bytes" : parseFloat((a / pow(k, d)).toFixed(max(0, b))) + " " + ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][d]
    }
}
class Create {
    async folder(path) {
        if(await this.exist( path)) return false;
        fs.mkdirSync(project_path + "\\" + path, {recursive: true});
        return true;
    }

    async file(path, data) {
        if(await this.exist( path)) return false;
        fs.writeFileSync(project_path + "\\" + path, data, {flag:'a+'});

        return true;
    }

    async exist(path) {
        return fs.existsSync(project_path + "\\" + path);
    }

    async stream(full_path) {
        return fs.createWriteStream(full_path);
    }


}

module.exports = Create;