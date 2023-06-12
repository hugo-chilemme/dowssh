const store = require('data-store')({ path: process.cwd() + '/bin/core/hosts.json' });
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');


/**
* Function to add a host
* 
* @param {object} options: contains the username and password, port etc.
*/
exports.add = options => {
    const uuid = uuidv4();
    
    if (!options.address || !options.username || !options.port ) {
        throw new Error('Missing required fields: host, username, port');
    }

    if (options.port < 0 || options.port > 65535) {
        throw new Error('Invalid port');
    }

    if (options.privateKey) {
        options.privateKey = fs.readFileSync(options.privateKey);
    }
    options.uuid = uuid;
    store.set(uuid, options);
    return uuid;
}


/**
* Function to get a host
* 
* @param {string} uuid: the uuid of the host
*/
exports.get = uuid => {
    return store.get(uuid);
}



/**
* Function to get all hosts without passwords
*/
exports.all = () => {
    return store.data;
}


/**
* Function to edit a host
* 
* @param {string} uuid: the uuid of the host
* @param {object} options: contains the username and password, port etc.
*/
exports.edit = (uuid, options) => {
    store.set(uuid, options);
}