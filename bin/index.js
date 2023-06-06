const SFTPConnector = require('./libs/SFTPConnector');
const fs = require('fs');

const options = {
    host: 'localhost',
    port: '22',
    username: 'root',
}


const start = async () => {
    const session = new SFTPConnector();
    const status = await session.connect(options);

    if (!status.ok) {
        console.log(status.error);
        return;
    }


}
start();