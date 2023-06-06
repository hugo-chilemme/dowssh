const SFTP = require('ssh2-sftp-client');


module.exports = class SFTPConnector {
    #conn = new SFTP();

    /**
    * Function to connect to the server
    * 
    * @param {object} config: contains the username and password, port etc.
    */
    async connect(config) {
        try {
            await this.#conn.connect(config);
            return { ok: true };
        } catch (e) { return { ok: false, error: e.message }; }
            
    }

    /**
    * Function to list files and directories of the path
    * 
    * @param {string} path: path to list
    */
    async list(path) {
       return await this.#conn.list(path);
    }
    
    /**
     * Function to create a new directory
     * 
     * @param {string} path: path of the new directory
     * @param {boolean} recursive: if you need to create a directory recursively
     */
    async mkdir(path, recursive = false) {
        return await this.#conn.mkdir(path, recursive);
    }

    /**
     * Function to create a new file
     * 
     * @param {string} path: path of the new file
     */
    async mkfile(path) {
        return await this.#conn.put(Buffer.from(''), path)
    }


}