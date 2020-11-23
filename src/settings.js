const { Accessor, Table, Inserter, Query } = require("../onboard/main")
    //provides an interface between for the onboard storage 
function buildSettings(p) {
    //called on every app start
    console.log("Building settings, but never gets overwritten, if the file (table) already exists ")
    new Table("settings", p, false, {
        buildData: {
            autoBuild: true,
            readFromName: true,
            version: "",
            games: "",
            author: "",
            description: "",
        }
    })
}

function setSetting(field, value) { //sets a setting
    const settings = new Accessor("settings")
    settings.update(field, value)
}

function getSetting(entry, field) { //gets a setting or settings
    const settings = new Accessor("settings")
    var ret
    if (!field) {
        settings.query({ key: entry }, (res) => {
            ret = res
        })
    } else {
        settings.query({ key: entry }, (res) => {
            ret = res[field]
        })
    }
    return ret
}

module.exports = { buildSettings, setSetting, getSetting }