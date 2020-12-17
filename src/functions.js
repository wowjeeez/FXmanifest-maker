const fs = require('fs')
const path = require('path')
    //more like function.js lol
    //reads a directory with all the subdirectories
const readFilesSync = (dir, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {

        filelist = fs.statSync(path.join(dir, file)).isDirectory() ?
            readFilesSync(path.join(dir, file), filelist) :
            filelist.concat(path.join(dir, file));

    });
    return filelist;
}

function replaceLast(str, search, repl) {
    var a = str.split("");
    var length = search.length;
    if (str.lastIndexOf(search) != -1) {
        for (var i = str.lastIndexOf(search); i < str.lastIndexOf(search) + length; i++) {
            if (i == str.lastIndexOf(search)) {
                a[i] = repl;
            } else {
                delete a[i];
            }
        }
    }

    return a.join("");
}

function getExternals(str) {
    let entries = str.split(",")
    let n_entries = []
    entries.forEach(entry => {
        entry = entry.replace(`"`, "").replace(`"`, "").replace(`'`, "").replace(`'`, "")
        if (entry.includes("@")) {
            entry = `'@${entry.match(/(?<=@).*/).toString()}'` //recreate new entry
            console.log(`Entry: ${entry}`)
            n_entries.push(entry)
        }
    })
    return n_entries
}


let clearArr = (arr) => arr.filter((v, i) => arr.indexOf(v) === i)

module.exports = { readFilesSync, replaceLast, getExternals, clearArr }