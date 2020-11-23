//does nothing
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
try {
    const cpp = require('../build/Release/worker');
} catch (err) {}

function execAddon(nm) {
    cpp[nm]()
}
module.exports = { execAddon }

//node-gyp configure && node-gyp build &&

//"rebuild": "electron-rebuild -f -w FXmanifest-maker"