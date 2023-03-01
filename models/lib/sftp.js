
    const Client = require('ssh2-sftp-client');
    const s_sftp = new Client();

    class sftp {
        constructor(options) {
            this.options = options;
            console.log(this.options);

        }

        connect() {
            this.sftp = s_sftp.connect(this.options).then(() => {
                console.log(`sftp connected to ${this.options.address}:${this.options.port}`);

            }).catch((err) => {
                console.error(err);

                console.error(`cannot connect to ${this.options.address}:${this.options.port}`);

            });
        }


    }

    module.exports = { sftp };


