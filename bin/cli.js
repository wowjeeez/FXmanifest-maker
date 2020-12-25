#!/usr/bin/env node
 //Currently, we wont even interact with the main proc, we will just steal their functions and use the .cli property to control their behaviors, I'm kind of proud to this because it didnt require too much tweaking
const readline = require("readline")
const chalk = require('chalk')
const ora = require('ora');
const { handler, prebuild, writeManif } = require('../main')
const currDir = process.cwd()
const { table } = require('table');
const { allowedNodeEnvironmentFlags } = require("process");
console.log(`Manifest in: ${currDir}`)
let args = []
    //remove the first 2 useless elements
process.argv.forEach((e, i, a) => {
    if (i != 0 && i != 1) {
        args.push(e)
    }
})
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})
let options = {}
    //I dont want to use a library for this, I will just handle it myself
if (args.includes("-k")) {
    options.keepExt = true
} else {
    options.keepExt = true
}

if (args.includes("-f")) {
    options.filenames = true
} else {
    options.filenames = true
}
if (args.includes("-a")) {
    options.auth = args[args.indexOf("-a") + 1] //super smort
} else {
    options.auth = "Unknown"
}
if (args.includes("-g")) {
    let game = args[args.indexOf("-g") + 1] //needs formatting
    if (game == "both") {
        game = `"gta5", "rdr3"`
    } else if (game == "common") {
        game = "'common'"
    } else {
        game = `"${game}"`
    }
    options.game = game
} else {
    options.game = `"gta5"`
}
if (args.includes("-d")) {
    options.descr = args[args.indexOf("-d") + 1]
} else {
    options.descr = "Unknown"
}
if (args.includes("-fxv")) {
    options.fxv = args[args.indexOf("-fxv") + 1]
} else {
    options.fxv = "cerulean"
}
options.pth = currDir
options.cli = true
var spinner = ora({
    text: "Parsing files... \n"
}).start();
handler(null, options, record => {
        spinner.succeed("Parsed all files")
        let tbl = [
            [chalk.yellow.bold("Name"), chalk.yellow.bold("Entry type")]
        ]
        record.forEach(e => {
            tbl.push([chalk.bold(e.name), chalk.bold(e.type.charAt(0).toUpperCase() + e.type.slice(1))])
        })
        console.log(chalk.red(" \n \n        File entries: \n \n \n"))
        console.log(table(tbl))
        rl.question("Proceed with building the manifest? (y/n)", ans => {
            if (ans.toLowerCase() == "y") {
                var spinner = ora({
                    text: "Writing manifest... \n"
                }).start();
                writeManif(null, { cli: true }, console => { //send back the whole console obj
                    spinner.succeed("Manifest built")
                    console.log(chalk.green("Manifest successfully built!. \nThank your for using my tool!"))
                    process.exit()
                })
            } else {
                console.log(chalk.red("Building cancelled, no file was created or edited. \nThank your for using my tool!"))
                process.exit()
            }
        })
    })
    /* just to help with the fields
    const meta = {
                fxv: $("#fxv").val(),
                game: game,
                auth: $("#author").val() || "no one",
                descr: $("#descr").val() || "nothing",
                filenames: $("#filename").is(':checked'),
                keepExt: $("#keepexts").is(':checked'),
            }*/