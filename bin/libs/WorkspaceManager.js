const fs = require('fs');
const tmpPath = process.cwd() + '/.workspace/';

if (fs.existsSync(tmpPath)) {
    fs.rmSync(tmpPath, { recursive: true, force: true });
}
fs.mkdirSync(tmpPath);
console.log('initialize cache folder');
