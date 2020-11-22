//used internally, not part of the final install
const fs = require('fs')
const { GitProcess, GitError, IGitResult } = require('dugite')
const package = JSON.parse(fs.readFileSync("package.json"))
const { exec } = require("child_process");
const v = package.version
console.log(`Creating new release (current version: ${v})`)
var last = parseInt(v.slice(4))
var middle = parseInt(v.slice(2))
var first = parseInt(v.slice(0))
if (last == 9) {
    middle += 1
    last = 0
} else if (middle == 9) {
    first += 1
    middle = 0
} else {
    last += 1
}


const newV = `${first}.${middle}.${last}`
console.log(`New version parsed: ${newV}`)
package.version = newV
fs.writeFileSync("package.json", JSON.stringify(package, null, 2))
    //need to figure out an async solution for this, to wait until the commit/push completes found the solution like 30 seconds after writing this comment lol
async function github() {
    await GitProcess.exec(["commit", "-a", '-m "This is an automatic release"'], __dirname)
    await GitProcess.exec(["tag", `v${newV}`], __dirname)
    await GitProcess.exec(["push", "origin"])
}
github()
console.log("Pushed new release")