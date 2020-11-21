const fs = require('fs')
const path = require('path')

const readFilesSync = (dir, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {

        filelist = fs.statSync(path.join(dir, file)).isDirectory() ?
            readFilesSync(path.join(dir, file), filelist) :
            filelist.concat(path.join(dir, file));

    });
    return filelist;
}
module.exports = { readFilesSync }