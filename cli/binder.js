const express = require('express')
const bodyParser = require('body-parser') //fucking noob cant use the original nodejs http package for simple ass tasks
const API = express()
API.use(bodyParser.urlencoded({ extended: false }))
API.use(bodyParser.json());
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
API.get("/", (req, res) => {
    res.status(200).send(`<p style="color: lightgreen; font-family: Arial; font-size: 150px; text-align: center;">Local Fxmanifest-maker API is up and running!</p>`)

})
API.post("/create", (req, res) => {
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
        res.status(200).send("Built manifest")
    }
})


function invokeAPI() {
    API.listen(port, () => {
        console.log(`Api invoked, and stable`)
    })
}
module.exports = { invokeAPI }