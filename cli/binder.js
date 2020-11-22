const http = require('http')
const { buildSettings, setSetting, getSetting } = require("../core/settings")
const { userdir, handler, prebuild, writeManif } = require("../core/main")
const port = 2132
    //yes, api access is solved with http requests no com DLLs or any other properly working methods
var routes = {}
    //thats all we need here (currently)
routes["POST"] = {}
routes["GET"] = {}

function pipe(rt, meth, fn) {
    routes[meth][rt] = fn
}
pipe("/", "GET", (req, res) => {
    res.statusCode = 200
    res.end()
})
pipe("/create", "POST", (req, res) => {
    const body = JSON.parse(req.body)
    const path = body.path
    const fxv = body.fxv
    const settings = getSetting("buildData")
    const final = {
        instant: true,
        fxv: fxv || settings.version,
        game: settings.games,
        auth: settings.author,
        descr: settings.description,
        filenames: settings.readFromName,
    }
    prebuild(path)
    handler({}, final)
    var ret = writeManif()
    if (ret) {
        res.statusCode = 200
        res.end()
    }
})

function requestListener(req, res) {
    if (routes[req.method][req.path]) {
        routes[req.method][req.path](req, res)
    }
}

function invokeAPI() {
    const server = http.createServer(requestListener);
    server.listen(port, "localhost", () => {
        console.log(`API invoked`);
    });
}
module.exports = { invokeAPI }