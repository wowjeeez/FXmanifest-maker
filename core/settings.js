const { Accessor, Table, Inserter, Query } = require("../onboard/main")

function buildSettings(p) {
    console.log("Building settings")
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

function setSetting(field, value) {
    const settings = new Accessor("settings")
    settings.update(field, value)
}

function getSetting(entry, field) {
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