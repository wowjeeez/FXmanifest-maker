const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const { invokeAPI } = require('../cli/binder')
const { buildSettings, setSetting, getSetting } = require("./settings")
const fs = require('fs')
const path = require('path')
const buffer = require('buffer')
const renderer = ("./renderer")
var win
const { readFilesSync } = require('./functions')
const pattern = `(?<=MANIF:).*`
const userdir = app.getPath("appData")

function prebuild(dir) {
    rel = dir
    console.log("Path: " + rel)
    files = readFilesSync(rel)
}

const handler = function(event, arg) {
    console.log("Parsing files...")
    metadata = arg
    arg.instant = arg.instant || false
    files.forEach(file => {
        const buff = fs.readFileSync(file)
        const content = buff.toString()
        var type = content.match(pattern)
        console.log(`File: ${file}`)
        if (type != null || type != undefined) {
            type = type.toString().replace(/ /g, '')
        }
        const pth = path.relative(rel, file).replace("\\", "/")
        console.log(`Relative path: ${pth}`)
        if (type) {
            switch (type) {
                case "SV":
                    console.log("Pushing server script")
                    server_scripts.push(`'${pth}', \n`)
                    record.push({ name: pth, type: "server" })
                    break
                case "CL":
                    console.log("Pushing client script")
                    client_scripts.push(`'${pth}', \n`)
                    record.push({ name: pth, type: "client" })
                    break
                case "SH":
                    console.log("Pushing shared script")
                    shared_scripts.push(`'${pth}', \n`)
                    record.push({ name: pth, type: "shared" })
                    break
                case "UIP":
                    console.log("Pushing ui page")
                    ui_page = `'${pth}' \n`
                    record.push({ name: pth, type: "ui" })
                    break
                case "FILE":
                    console.log("Pushing file")
                    _files.push(`'${pth}', \n`)
                    record.push({ name: pth, type: "file" })
                    break
            }
        } else {
            if (getSetting("buildData", "readFromName") && metadata.filenames || metadata.filenames) {
                console.log("Checking filenames (the setting is on)")
                var m = pth.match(`.*(?=\/)`)
                if (m) {
                    //if the file is in a subfolder then get only the filename to avoid folder name issues
                    m = m.toString()
                    m = pth.replace(m, "").replace(`/`, "")
                } else {
                    m = pth
                }
                if (m == "index.html") {
                    console.log("Found index.html, pusing it as UI page")
                    ui_page = `'${pth}' \n`
                    record.push({ name: pth, type: "ui" })
                }
                m = m.match(/^.*?(?=\.)/).toString() //basic string regex didnt work here lol
                    //switch statements didnt work here (because we dont check the string literally)
                if (m.includes("server") || m.includes("SV")) {
                    console.log("Pushing server script")
                    server_scripts.push(`'${pth}', \n`)
                    record.push({ name: pth, type: "server" })

                } else if (m.includes("client") || m.includes("CL")) {
                    console.log("Pushing client script")
                    client_scripts.push(`'${pth}', \n`)
                    record.push({ name: pth, type: "client" })

                } else if (m.includes("shared") || m.includes("SH")) {
                    console.log("Pushing shared script")
                    shared_scripts.push(`'${pth}', \n`)
                    record.push({ name: pth, type: "shared" })
                } else {
                    if (!pth.includes("index.html")) {
                        console.log("Ignoring file: " + pth)
                    }
                }
            } else {
                console.log("File name reading is off, ignoring file: " + pth)
            }

        }
    })
    try {
        if (!arg.instant) {
            event.reply("parsedFiles", record)
        } else {
            event.reply("redir", {
                __name: "build",
                instant: true,
            })
        }
    } catch (err) {}
}

const writeManif = function(ev, dat) {
        console.log(`Ui page: ${ui_page}`)
        console.log("Building manifest file")
            //prevent undefined entries
        if (ui_page) {
            console.log("Parsing ui page")
            ui_page = "ui_page " + ui_page
        } else {
            ui_page = ""
        }
        dat = dat || {}
            //formatting the file
        var final = `--Made with: fxmanifest-maker (https://github.com/LedAndris/FXmanifest-maker)
fx_version "${metadata.fxv}" 
games {${metadata.game}}
author "${metadata.auth}" 
description "${metadata.descr}"
${ui_page}files ${format(_files).join("")}client_scripts ${format(client_scripts).join("")}server_scripts ${format(server_scripts).join("")}shared_scripts ${format(shared_scripts).join("")}`
        fs.writeFileSync(rel + "/fxmanifest.lua", final)
        try {
            if (!dat.instant) {
                ev.reply("written")
            } else {
                ev.reply("parse")
            }
            return true
        } catch (err) {}

    }
    //handler functions to call from binder
module.exports = { userdir, handler, prebuild, writeManif }

const { Accessor, Table, Inserter, Query } = require("../onboard/main")
const { format } = require("./formatter")

try {
    function createWindow() {
        var title
        if (getSetting("buildData", "autoBuild")) {
            title = "Fxmanifest maker (quick manifest making is enabled)"
        } else {
            title = "Fxmanifest maker (quick manifest making is disabled)"

        }
        win = new BrowserWindow({
                width: 800,
                height: 600,
                webPreferences: {
                    nodeIntegration: true
                },
                title: title,
                icon: 'build/icon.png',
                backgroundColor: "#3e4247",
            })
            //win.webContents.openDevTools()
        win.setMenuBarVisibility(false)
        win.loadFile('../index.html'),
            invokeAPI()
        buildSettings(userdir) //exports werent working as imagined
    }

    app.whenReady().then(createWindow)

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit()
            console.log(`App closed, all systems have been shut down`)
        }
    })

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
    var files
    var rel


    ipcMain.on("openFolder", (event, ar) => {
        console.log("Received event")
        var folder = dialog.showOpenDialogSync(win, {
            properties: ['openDirectory']
        })

        if (folder) {
            rel = folder[0]
            console.log("Path: " + rel)
            files = readFilesSync(rel)
            if (!getSetting("buildData", "autoBuild")) {
                event.reply("openForm")
            } else {
                console.log("Autobuilding manifest")
                const settings = getSetting("buildData")
                event.reply("redir", {
                        __name: "metadata",
                        fxv: settings.version,
                        game: settings.games,
                        auth: settings.author,
                        descr: settings.description,
                        filenames: settings.readFromName,
                        instant: true,
                    }) //cant send events from here so redirect back to the renderer

            }
        }

    })
    var server_scripts = []
    var shared_scripts = []
    var client_scripts = []
    var _files = []
    var ui_page
    var record = []
    var metadata = {}
    ipcMain.on("metadata", handler)

    ipcMain.on("build", writeManif)

    ipcMain.on("exit", (ev, dat) => {
        app.exit()
    })


    ipcMain.on("getSettings", (ev, dat) => {
        var settings
        var tbl = new Accessor("settings")
        tbl.query({ key: "buildData" }, (res) => {
            settings = res
        })
        ev.reply("settings", settings)
    })

    ipcMain.on("setSettings", (ev, data) => {
        setSetting("buildData", {
            autoBuild: data.quickMode,
            readFromName: data.filenames,
            version: data.fxv,
            games: data.game,
            author: data.auth,
            description: data.descr,
        })
        if (data.quickMode) {
            win.setTitle("Fxmanifest maker (quick manifest making is enabled)")
        } else {
            win.setTitle("Fxmanifest maker (quick manifest making is disabled)")

        }
    })

} catch (err) {
    dialog.showErrorBox("Error during proccess", "Something went wrong while executing, please try again, if the problem persists, then please create an issue on github (error: " + error + ")")
}