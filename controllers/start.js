
    const models = require('../models/__init__')
    require('../apps/__init__')
    const fs = require('fs')

    const privateKey = fs.readFileSync('C:\\Users\\hugoc\\.ssh\\id_ed25519.ppk');
    const puttyKey = privateKey.toString();

    const host = new models.sftp({
        address: "152.228.133.175",
        port: 9429,
        username: "sherlock",
        privateKey: puttyKey
    })
    host.connect()