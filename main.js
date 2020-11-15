const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const fs = require('fs')
const path = require('path')
const buffer = require('buffer')
const renderer = ("./renderer")
var win
const { readFilesSync } = require('./functions')
const pattern = `(?<=MANIF:).*`
const { buildSettings, setSetting, getSetting } = require("./settings")
const { Accessor, Table, Inserter, Query } = require("./onboard/main")

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
            icon: 'assets/icon.png',
            backgroundColor: "#3e4247",
        })
        //win.webContents.openDevTools()
    win.setMenuBarVisibility(false)
    win.loadFile('index.html')
    buildSettings()
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
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
var metadata
ipcMain.on("metadata", (event, arg) => {
    console.log("Parsing files...")
    metadata = arg
    arg.instant = arg.instant || false
    files.forEach(file => {
        const buff = fs.readFileSync(file)
        const content = buff.toString()
        var type = content.match(pattern)
        console.log(`Filetype: ${type}`)
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
            }
        } else {
            console.log("Ignoring file: " + pth)
        }
    })
    if (!arg.instant) {
        event.reply("parsedFiles", record)
    } else {
        event.reply("redir", {
            __name: "build",
            instant: true,
        })
    }
})
ipcMain.on("build", (ev, dat) => {
    console.log("Building manifest file")
    dat = dat || {}
    var final = `
    fx_version "${metadata.fxv}" 
    games {${metadata.game}}
    author "${metadata.auth}" 
    description "(Made with FXmanifest maker) ${metadata.descr}" 
    ui_page ${ui_page} 
    files {
        ${_files.join()}} \n 
    client_scripts {
        ${client_scripts.join()}} 
    server_scripts {
        ${server_scripts.join()}} 
    shared_scripts {
        ${shared_scripts.join()}} 
    `
    fs.writeFileSync(rel + "/fxmanifest.lua", final)
    if (!dat.instant) {
        ev.reply("written")
    } else {
        ev.reply("parse")
    }

})

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