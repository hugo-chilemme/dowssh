

const path = (folder) => {
    let userdata = (process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share"));
    if(folder === 'profile')
        userdata += "/dowssh/profile";
    return userdata;
}

exports.path = path;