const SFTP = require('ssh2-sftp-client');


module.exports = class SFTPConnector {
    #conn = new SFTP();

    async connect(config) {
        try {
            await this.#conn.connect(config);
            return { ok: true };
        } catch (e) { return { ok: false, error: e.message }; }
            
    }



}