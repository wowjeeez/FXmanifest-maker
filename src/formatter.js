//formats an array depending on its size (so we will get better readability in the manifest)
function format(arr) {
    if (arr.length == 0) {
        arr.unshift('{');
        arr.push("}\n")
    } else {
        arr.unshift('{\n');
        arr.push("}\n")
    }
    return arr
}
module.exports = { format }
    //for some strange reason I put this into a separate file I have no idea why