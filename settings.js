const { Accessor, Table, Inserter, Query } = require("./onboard/main")

function buildSettings() {
    const settings = new Table("settings", false, {
        buildData: {
            autoBuild: false,
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