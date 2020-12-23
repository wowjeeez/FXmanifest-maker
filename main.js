const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron')
const { buildSettings, setSetting, getSetting } = require("./src/settings")
const fs = require('fs')
const path = require('path')
const buffer = require('buffer')
const renderer = ("./renderer")
var win
const { readFilesSync, replaceLast, getExternals } = require('./src/functions')
const pattern = `(?<=MANIF:).*` //TODO! make this configgable
let userdir
try {
    userdir = app.getPath("appData")
} catch (err) {
    userdir = false
}
let v
try {
    v = app.getVersion()
} catch (err) {
    v = false
}
var server_scripts = []
var shared_scripts = []
var client_scripts = []
var deps = []
var _files = []
var ui_page
var externals = null
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
var handler
try {
    handler = function(event, arg, cb = function() {}) {
        //handles the file parsing
        metadata = arg
        let oc
        if (metadata.cli) {
            oc = console.log //disable console logs
            console.log = function() {}
        }
        console.log("Parsing files...")
        try {
            metadata.fxv = metadata.fxv.toLowerCase()
        } catch (err) {}
        files = files || readFilesSync(metadata.pth) //cli compatibility
        rel = rel || metadata.pth
        arg.instant = arg.instant || false
        files.forEach(file => {
            if (!file.includes(".git")) { //.git files have no extension so they fuck up the logic, //TODO! change this, to a more wide-use case check
                const buff = fs.readFileSync(file)
                const content = buff.toString()
                var type = content.match(pattern) //this captures: ex.: MANIF:"CL"
                console.log(`File: ${file}`)
                if (type != null || type != undefined) {
                    type = type.toString().replace(/ /g, '')
                }
                const pth = path.relative(rel, file).replace(/\\/g, "/")
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
                        var rp = pth.match(`.*(?=\/)`) //check if the path contains / symbols (so not in the root folder)
                        if (rp) {
                            //if the file is in a subfolder then get only the filename to avoid folder name issues
                            rp = rp.toString()
                            rp = pth.replace(rp, "").replace(`/`, "")
                        } else {
                            rp = pth
                        }
                        if (rp == "index.html") {
                            console.log("Found index.html, pusing it as UI page")
                            ui_page = `'${pth}' \n`
                            record.push({ name: pth, type: "ui" })
                            _files.push(`'${pth}', \n`)
                            record.push({ name: pth, type: "file" })
                        }
                        if (rp.includes(".ttf")) {
                            _files.push(`'${pth}', \n`)
                            record.push({ name: pth, type: "file" })
                        }
                        m = rp.match(/^.*?(?=\.)/) //we get everything before the first . symbol
                        if (m) {
                            m = m.toString()
                        } else {
                            m = rp
                        }
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

        if (metadata.cli) { //restore console.log
            console.log = oc
        }
        try {
            if (!arg.cli) {
                if (!arg.instant) {
                    event.reply("parsedFiles", record)
                } else {
                    event.reply("redir", {
                        __name: "build",
                        instant: true,
                    })
                }
            } else {
                cb(record)
                    //TODO! cli handling
            }

        } catch (err) {
            throw new Error(`Error occured while executing finalizing page, err: ${err}`)
        }
    }
} catch (err) {
    throw new Error(`Error occured while executing main handler() func, error: \n ${err}`)
}

const writeManif = function(ev, dat, cb = function() {}) {
    //creates the manifest file itself, with the data read by the "handler" func
    let oc
    dat = dat || {}
    if (dat.cli) {
        oc = console.log
        console.log = function() {}
    }
    console.log(`Ui page: ${ui_page}`)
    console.log("Building manifest file")
        //prevent undefined entries
    if (ui_page) {
        console.log("Parsing ui page")
        ui_page = "ui_page " + replaceLast(ui_page, " ", "")
    } else {
        ui_page = ""
    }
    //formatting the file
    var final = `--Made with: fxmanifest-maker (https://github.com/LedAndris/FXmanifest-maker)
fx_version "${replaceLast(metadata.fxv, " ", "")}"
games {${replaceLast(metadata.game, " ", "")}}
author "${replaceLast(metadata.auth, " ", "")}" 
description "${replaceLast(metadata.descr, " ", "")}"
${ui_page}files ${format(_files).join("")}client_scripts ${format(client_scripts).join("")}server_scripts ${format(server_scripts).join("")}shared_scripts ${format(shared_scripts).join("")}`
    fs.writeFileSync(rel + "/fxmanifest.lua", final)
    try {
        if (!dat.instant && !dat.cli) {
            ev.reply("written")
        } else if (!dat.cli) {
            ev.reply("parse")
        }
        if (dat.cli) {
            console.log = oc
            cb(console)
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
    if (app) {

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
        ipcMain.on('setPath', (event, p) => {
            read(p)
        })
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
                            let rawmanifest = fs.readFileSync(`${rel}/fxmanifest.lua`).toString()
                            var vers = rawmanifest.match(/(?<=fx_version ).*/) //holy shit how ugly
                            var auth = rawmanifest.match(/(?<=author ).*/)
                            var descr = rawmanifest.match(/(?<=description ).*/)
                                //prevent null errors:
                            if (vers) {
                                vers = vers.toString().replace(/"/g, "").replace(/'/g, "")
                            }
                            if (auth) {
                                auth = auth.toString().replace(/"/g, "").replace(/'/g, "")
                            }
                            if (descr) {
                                descr = descr.toString().replace(/"/g, "").replace(/'/g, "")
                            }
                            settings.version = vers
                            settings.author = auth
                            settings.description = descr
                            rawmanifest = rawmanifest.replace(/\(/g, " ") //sanitize
                            rawmanifest = rawmanifest.replace(/\)/g, " ")
                            rawmanifest = rawmanifest.replace(/'/g, `"`) // will be much easier to work with
                            rawmanifest = rawmanifest.replace(/\r?\n?/g, '').replace(/\s\s+/g, ' ').replace(/\}/g, "}\n")
                                //get all files that are already in the manifest
                            var pref = {}
                            var dependencies = {}
                                //object like entries:
                            pref.clients = rawmanifest.match(/(?<=client_scripts {)(.*)(?=})/)
                            pref.servers = rawmanifest.match(/(?<=server_scripts {)(.*)(?=})/)
                            pref.shareds = rawmanifest.match(/(?<=shared_scripts {)(.*)(?=})/)
                            pref.files = rawmanifest.match(/(?<=files {)(.*)(?=})/)
                            dependencies.o = rawmanifest.match(/(?<=dependencies {)(.*)(?=})/) || []
                                //string like entries:
                            pref.client = rawmanifest.match(/(?<=client_script ).*/) //examples to bad naming can be seen here
                            pref.server = rawmanifest.match(/(?<=server_script ).*/)
                            pref.shared = rawmanifest.match(/(?<=shared_script ).*/)
                            pref.file = rawmanifest.match(/(?<=file ).*/)
                            dependencies.s = rawmanifest.match(/(?<=dependency ).*/) || [] //deps will be handled later on
                            for (const [k, v] of Object.entries(pref)) {
                                if (pref[k]) {
                                    if (k.endsWith("s")) { //maybe the naming was smart?
                                        pref[k] = pref[k].toString().split(",")
                                        pref[k] = pref[k].filter(function(item, index) {
                                                if (pref[k].indexOf(item) == index)
                                                    return item;
                                            })
                                            //for some reason every entry is doubled so we use this logic to get rid of the dupes
                                    } else {
                                        //single entries:
                                        pref[k] = pref[k].toString().replace(/\s\s+/g, '')
                                        pref[k] = pref[k].substring(0, pref[k].lastIndexOf(`"`)) + `"`
                                        pref[k + "s"] = pref[k + "s"] || [] //super smart naming
                                        pref[k + "s"].push(pref[k]) //merge single entries with the multiple ones so it will be easier to work with
                                    }
                                }
                            }
                            //another loop just to be clear
                            for (let [k, v] of Object.entries(dependencies)) {
                                if (v[0]) {
                                    dependencies[k] = v.toString()

                                    if (k != "s") { //this is a very asshole logic, it could be done much easier
                                        dependencies[k] = v.split(",")
                                    } else {
                                        dependencies[k] = dependencies[k].replace(/\s\s+/g, '')
                                        dependencies[k] = dependencies[k].substring(0, dependencies[k].lastIndexOf(`"`)) + `"`
                                        dependencies["o"].push(dependencies[k])
                                    }
                                }

                            }
                            console.log(dependencies)
                            var externals = {}
                            for (let [k, v] of Object.entries(pref)) {
                                if (typeof v == "object" && v) {
                                    v.forEach(entr => {
                                        if (entr.includes("@")) {
                                            console.log(`Externally loaded script found: ${entr} in entry: ${k}`)
                                            k = k.substring(0, k.length - 1) //remove the s
                                            externals[k] = externals[k] || []
                                            externals[k].push(entr)
                                        }
                                    })
                                }
                            }
                            pref = null //this could be a large object, so manual gc
                            console.log(externals)
                        } catch (err) {
                            console.log("Fxmanifest is probably empty or an error occured")
                            console.log(`Err: ${err}`)
                            externals = null //there will be a check later whether to show the front-end switch for deps and imported files or not
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
                            keepExt: externals ? true : false, //super cool check to show front-end switch
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
                                keepExt: externals ? true : false,
                            }) //cant send events from here, so redirect back to the renderer so the "metadata" event will run immediately (currently LN#398)

                    }
                }

            })
            //event handlers are located here (most of them)
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
    }
} catch (err) {
    //super error handling, worked 1 time
    if (dialog) {
        dialog.showErrorBox("Error during proccess", "Something went wrong while executing, please try again, if the problem persists, then please create an issue on github (error: " + err + ")")
    } else {
        console.log("Error during proccess", "Something went wrong while executing, please try again, if the problem persists, then please create an issue on github (error: " + err + ")")
    }
}