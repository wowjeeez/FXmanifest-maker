#!/usr/bin/env node
import chalk from 'chalk';
import inquirer from 'inquirer';
import {getFiles, getFileEntry, isSubInArray, handleDataFile, writeManifest} from "./lib";
import os from "os"
import { EntryFiles } from "./typings"
import path from "path"

// Questions should be structured differently
const pathQuestion = { type: "input", name: "path", message: "Please input your resource path", default: process.cwd()}
const fileNameQuestion = { type: "checkbox", name: "useNames", message: "Use filenames?", default: "yes", choices: [{ name: "yes", value: true}, { name: "no", value: false}]}
const authorQuestion = { type: "input", name: "author", message: "Author:", default: os.hostname() } // this will be written in to the manifest directly
const ignoreDirsQuestion = { type: "input", name: "ignoreDir", message: "Ignore the following directories, syntax: (dir1, dir2)", default: "node_modules, .git" }
const ignoreExtQuestion = { type: "input", name: "ignoreExt", message: "Ignore the following extensions, syntax: (.extension1, extension2)", default: ".map" }


let ignored: number = 0
const entries: EntryFiles = {
  SV: [],
  CL: [],
  SH: [],
  UIP: [],
  FILE: [],
  DATA_FILES: []
} 
let leftOut: number = 0
inquirer.prompt([pathQuestion, fileNameQuestion, authorQuestion, ignoreDirsQuestion, ignoreExtQuestion])
  .then(async (answers: { [key: string]: any }) => {
  answers["path"] = answers["path"].replace(/\\/g, "/")
    console.log(chalk.yellow(`Checking files in directoy: ${answers["path"]}`))
    let dirIgnores = []
    let extIgnores = []
    
    if (answers["ignoreDir"] == 0) {
      dirIgnores = ["wontUseThisDirectoryBecauseItDoesntExist"]
    } else {
      dirIgnores =  answers["ignoreDir"].replace(/\s/g, "").split(",")
    }
    
    if (answers["ignoreExt"] == 0) {
      extIgnores = ["wontUseThisExtensionBecauseItDoesntExist"]
    } else {
      extIgnores = answers["ignoreExt"].replace(/\s/g, "").split(",")
    }



  const start = Date.now()
  for await (const f of getFiles(answers["path"])) {
    if (!isSubInArray(dirIgnores, f) && !isSubInArray(extIgnores, f)) {
      const entryType = await getFileEntry(f, answers["useNames"])

      if (entryType.isEntry) {
        entries[entryType.entry].push("'" + path.relative(answers["path"], f).replace("\\", "/") + "',")
      } else {
        const dataFileRes = handleDataFile(f, entryType.entry, answers["path"])

        if (dataFileRes.isDataFile) {
          entries.DATA_FILES.push(dataFileRes.entry as string)
          entries.FILE.push(dataFileRes.path as string)

        } else {
          leftOut++
        }
      }
    } else {
      ignored++
    }
  }
    console.log(chalk.green(`Found ${leftOut} files without any entry specified and ignored ${ignored} in ${((Date.now() - start) / 1000).toFixed(4)} seconds`))
    console.log(chalk.yellow(`Writing manifest to: ${answers["path"]}/fxmanifest.lua`))
    await writeManifest(answers["path"], entries, answers["author"])
    console.log(chalk.green(`Manifest file written`))
})