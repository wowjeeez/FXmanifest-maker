#!/usr/bin/env node
"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = __importDefault(require("inquirer"));
const lib_1 = require("./lib");
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
// Questions should be structured differently
const pathQuestion = { type: "input", name: "path", message: "Please input your resource path", default: process.cwd() };
const fileNameQuestion = { type: "checkbox", name: "useNames", message: "Use filenames?", default: "yes", choices: [{ name: "yes", value: true }, { name: "no", value: false }] };
const authorQuestion = { type: "input", name: "author", message: "Author:", default: os_1.default.hostname() }; // this will be written in to the manifest directly
const ignoreDirsQuestion = { type: "input", name: "ignoreDir", message: "Ignore the following directories, syntax: (dir1, dir2)", default: "node_modules" };
const ignoreExtQuestion = { type: "input", name: "ignoreExt", message: "Ignore the following extensions, syntax: (.extension1, extension2)", default: ".map" };
let ignored = 0;
const entries = {
    SV: [],
    CL: [],
    SH: [],
    UIP: [],
    FILE: [],
    DATA_FILES: []
};
let leftOut = 0;
inquirer_1.default.prompt([pathQuestion, fileNameQuestion, authorQuestion, ignoreDirsQuestion, ignoreExtQuestion])
    .then(async (answers) => {
    var e_1, _a;
    answers["path"] = answers["path"].replace(/\\/g, "/");
    console.log(chalk_1.default.yellow(`Checking files in directoy: ${answers["path"]}`));
    const dirIgnores = answers["ignoreDir"].replace(/\s/g, "").split(",");
    const extIgnores = answers["ignoreExt"].replace(/\s/g, "").split(",");
    const start = Date.now();
    try {
        for (var _b = __asyncValues(lib_1.getFiles(answers["path"])), _c; _c = await _b.next(), !_c.done;) {
            const f = _c.value;
            if (!lib_1.isSubInArray(dirIgnores, f) && !lib_1.isSubInArray(extIgnores, f)) {
                const entryType = await lib_1.getFileEntry(f, answers["useNames"]);
                if (entryType.isEntry) {
                    entries[entryType.entry].push("'" + path_1.default.relative(answers["path"], f).replace("\\", "/") + "',");
                }
                else {
                    const dataFileRes = lib_1.handleDataFile(f, entryType.entry, answers["path"]);
                    if (dataFileRes.isDataFile) {
                        entries.DATA_FILES.push(dataFileRes.entry);
                        entries.FILE.push(dataFileRes.path);
                    }
                    else {
                        leftOut++;
                    }
                }
            }
            else {
                ignored++;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) await _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    console.log(chalk_1.default.green(`Found ${leftOut} files without any entry specified and ignored ${ignored} in ${((Date.now() - start) / 1000).toFixed(4)} seconds`));
    console.log(chalk_1.default.yellow(`Writing manifest to: ${answers["path"]}/fxmanifest.lua`));
    await lib_1.writeManifest(answers["path"], entries, answers["author"]);
    console.log(chalk_1.default.green(`Manifest file written`));
});
//# sourceMappingURL=index.js.map