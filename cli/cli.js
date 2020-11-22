const readline = require('readline');
var rl
hookCLI()

function hookCLI() {
    try { rl.close() } catch (err) {}
    console.log("Hooked cli")
    rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

}
console.log("Registering input listener")
rl.on('line', (input) => {
    console.log(`Received: ${input}`);
});
module.exports = { hookCLI }