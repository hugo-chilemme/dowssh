const SFTP = require('ssh2-sftp-client');
const fs = require('fs');

module.exports = class SFTPConnector {
    /**
    * Import a SFTP connection
    */
    #conn = new SFTP();


    /**
    * Function to connect to the server
    * 
    * @param {object} config: contains the username and password, port etc.
    */
    async connect(config) {
        try {
            await this.#conn.connect(config);
            this.username = config.username;
            return { ok: true };
        } catch (e) { 
            console.log(e)
            return { ok: false, error: e.message };
         }
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


    /**
     * Function to delete a directory
     * 
     * @param {string} path: path to the folder to delete
     * @param {boolean} recursive: if you want to delete all children files
     */
    async rmdir(path, recursive = false) {
        return await this.#conn.rmdir(path, recursive);
    }


    /**
    * Function to delete a file
    * 
    * @param {string} path: path to the file to be deleted
    */
    async rmfile(path) {
        return await this.#conn.delete(path);
    }


    /**
    * Function to rename a file or a folder
    * 
    * @param {string} path: the path with the file or folder 
    * @param {string} destPath: the destination path 
    */
    async rename(path, destPath) {
        return await this.#conn.rename(path, destPath);
    }        


    /**
    * Alias of @rename function
    */
    async move() {
        return (...args) => this.rename(...args);
    }   


    /**
    * Function to upload a file
    * 
    * @param {string} path: the path of the local file 
    * @param {string} destPath: the destination path 
    */
    async upfile(path, destPath) {
        const file = fs.createReadStream(path, 'utf8');
        return await this.#conn.put(file, destPath);
    }        


    /**
    * Function to upload a directory
    * 
    * @param {string} path: the path of the local folder 
    * @param {string} destPath: the destination path 
    */
    async updir(path, destPath) {
        return await this.#conn.uploadDir(path, destPath);
    }   


    /**
    * Function to download a file
    * 
    * @param {string} remotePath: the path of the remote file 
    * @param {string} localPath: the destination path  
    */
    async downfile(remotePath, localPath) {
        const file = fs.createWriteStream(localPath);
        return await this.#conn.fastGet(remotePath, file);
    }   


    /**
    * Function to download a folder
    * 
    * @param {string} remotePath: the path of the remote file 
    * @param {string} localPath: the destination path  
    */
    async downdir(remotePath, localPath) {
        return await this.#conn.downloadDir(remotePath, localPath);
    }   
}