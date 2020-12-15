const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron')
const { buildSettings, setSetting, getSetting } = require("./src/settings")
const fs = require('fs')
const path = require('path')
const buffer = require('buffer')
const renderer = ("./renderer")
var win
const { readFilesSync, replaceLast } = require('./src/functions')
const pattern = `(?<=MANIF:).*`
const userdir = app.getPath("appData")
const { execAddon } = require("./src/workerthrd")
const v = app.getVersion()
var server_scripts = []
var shared_scripts = []
var client_scripts = []
var _files = []
var ui_page
var record = []
var metadata = {}
var files //centralized so all "global" variables are declared here
var rel
    //reads all the files (not currently used)
function read(dir) {
    rel = dir
    console.log("Path: " + rel)
    files = readFilesSync(rel)
}

const handler = function(event, arg) {
    //handles the file parsing
    console.log("Parsing files...")
    metadata = arg
    try {
        metadata.fxv = metadata.fxv.toLowerCase()
    } catch (err) {}
    arg.instant = arg.instant || false
    files.forEach(file => {
        if (!file.includes(".git")) {
            const buff = fs.readFileSync(file)
            const content = buff.toString()
            var type = content.match(pattern)
            console.log(`File: ${file}`)
            if (type != null || type != undefined) {
                type = type.toString().replace(/ /g, '')
            }
            const pth = path.relative(rel, file).split("\\").join("/")
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
                        _files.push(`'${pth}', \n`) //have to add ui page as a file too
                        record.push({ name: pth, type: "file" })
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
                    var m = pth.match(`.*(?=\/)`) //check if the path contains / symbols (so not in the root folder)
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
                        _files.push(`'${pth}', \n`)
                        record.push({ name: pth, type: "file" })
                    }
                    if (m.includes(".ttf")) {
                        _files.push(`'${pth}', \n`)
                    }
                    m = m.match(/^.*?(?=\.)/).toString() //we get everything before the first . symbol
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
                        if (!pth.includes("index.html") && !m.includes(".ttf")) {
                            console.log("Ignoring file: " + pth)
                        }
                    }
                } else {
                    console.log("File name reading is off, ignoring file: " + pth)
                }
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
    //creates the manifest file itself, with the data read by the "handler" func
    console.log(`Ui page: ${ui_page}`)
    console.log("Building manifest file")
        //prevent undefined entries
    if (ui_page) {
        console.log("Parsing ui page")
        ui_page = "ui_page " + replaceLast(ui_page, " ", "")
    } else {
        ui_page = ""
    }
    dat = dat || {}
        //formatting the file
    var final = `--Made with: fxmanifest-maker (https://github.com/LedAndris/FXmanifest-maker)
fx_version "${replaceLast(metadata.fxv, " ", "")}"
games {${replaceLast(metadata.game, " ", "")}}
author "${replaceLast(metadata.auth, " ", "")}" 
description "${replaceLast(metadata.descr, " ", "")}"
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

function prebuild(dir) {
    rel = dir
    console.log("Path: " + rel)
    files = readFilesSync(rel)
}
//foundation functions for the binder, the events trigger these
module.exports = { userdir, handler, prebuild, writeManif }

const { Accessor, Table, Inserter, Query } = require("./onboard/main") //reading the whole settings object caused issues, so I had to make it to read manually
const { format } = require("./src/formatter")
const { fx } = require('jquery')

try {
    function createWindow() {
        var title
        if (getSetting("buildData", "autoBuild")) {
            title = "Fxmanifest maker (quick manifest making is enabled)"
        } else {
            title = "Fxmanifest maker (quick manifest making is disabled)"

        }
        //constructs the window itself
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
        win.loadFile('index.html')
        buildSettings(userdir) //exports werent working as imagined
        console.log("Executing C++") //does nothing at the moment
        execAddon("hello") //does nothing at the moment
    }

    app.whenReady().then(createWindow)
        //handles app behavios or based on system events
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


    //IPC events are handled here
    ipcMain.on("openFolder", (event, ar) => {
            console.log("Received event")
            var folder = dialog.showOpenDialogSync(win, {
                properties: ['openDirectory']
            })

            if (folder) {
                rel = folder[0]
                console.log("Path: " + rel)
                files = readFilesSync(rel)
                const settings = getSetting("buildData")
                if (fs.existsSync(`${rel}/fxmanifest.lua`)) {
                    console.log("Found existing fxmanifest, reading value from it")
                    try {
                        const rawmanifest = fs.readFileSync(`${rel}/fxmanifest.lua`).toString()
                        const vers = rawmanifest.match(/(?<=fx_version ).*/).toString().replace(`"`, "").replace(`"`, "").replace("'", "").replace("'", "") //holy shit how ugly
                        const auth = rawmanifest.match(/(?<=author ).*/).toString().replace(`"`, "").replace(`"`, "").replace("'", "").replace("'", "")
                        const descr = rawmanifest.match(/(?<=description ).*/).toString().replace(`"`, "").replace(`"`, "").replace("'", "").replace("'", "")
                        console.log(vers, auth, descr)
                        settings.version = vers
                        settings.author = auth
                        settings.description = descr
                    } catch (err) {
                        console.log("Fxmanifest is probably empty")
                    }

                }
                if (!getSetting("buildData", "autoBuild")) {
                    event.reply("openForm", {
                        version: settings.version,
                        games: settings.games,
                        auth: settings.author,
                        descr: settings.description,
                        filenames: settings.readFromName,
                        instant: true,
                    })
                } else {
                    console.log("Autobuilding manifest")
                    event.reply("redir", {
                            __name: "metadata",
                            version: settings.version,
                            games: settings.games,
                            auth: settings.author,
                            descr: settings.description,
                            filenames: settings.readFromName,
                            instant: true,
                        }) //cant send events from here so redirect back to the renderer

                }
            }

        })
        //event handlers are located here (most of them)
        //functions defined earlier piped to the events
    ipcMain.on("metadata", handler)

    ipcMain.on("build", writeManif)

    ipcMain.on("exit", (ev, dat) => {
            app.exit()
        })
        //this returns the version (v[defined at the top]) to the renderer
    ipcMain.on("getVersion", (ev, dat) => {
        ev.reply("version", v)
    })


    //this returns the settings to the renderer
    ipcMain.on("getSettings", (ev, dat) => {
            var settings
            var tbl = new Accessor("settings")
            tbl.query({ key: "buildData" }, (res) => {
                settings = res
            })
            ev.reply("settings", settings)
        })
        //this comes from the UI
    ipcMain.on("setSettings", (ev, data) => {
        setSetting("buildData", {
            autoBuild: data.quickMode,
            readFromName: data.filenames,
            version: data.fxv,
            games: data.game,
            author: data.auth,
            description: data.descr,
        })
        if (data.quickMode) { //I was lazy to make a UI display for this, so the quick option's state is only displayed at the window name (currently)
            win.setTitle("Fxmanifest maker (quick manifest making is enabled)")
        } else {
            win.setTitle("Fxmanifest maker (quick manifest making is disabled)")

        }
    })
} catch (err) { //super error handling, worked 1 time
    dialog.showErrorBox("Error during proccess", "Something went wrong while executing, please try again, if the problem persists, then please create an issue on github (error: " + error + ")")
}