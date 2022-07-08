# dowssh
> This project allows to download files from a given directory (recursively) the one useful the SFTP protocol in ssh

## In the future

- Ability to back up hosts

- Possibility to connect with a passphrase

- Interface to upload (to an upload/download client)

# Installation and use

1. Open a terminal and type
```
git clone https://github.com/HugoCLI/dowssh.git 
```

2. Then type
```
cd dowssh/ && npm i
```

3. You are ready to launch
```
node index.js
```

4. Enter your server information (here is an example)
```
Remote address > 84.201.1.50
SFTP access port (22 by default) > 22
Username > alice
Password > a_l_i_c_eee3
```

5. Choose the path to download
```
Directory to download > /var/www
```
**Do not put / at the end this one has not been taken into account for the moment**

