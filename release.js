//used internally, not part of the final install
const fs = require('fs')
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
exec(`git commit -m "This is an automatic release"`, (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`)
})

exec(`git tag v${newV}`, (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
})