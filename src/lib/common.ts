export function isSubInArray(arr: string[], text: string): boolean {
  let val: boolean = false //if I didnt utilize this var it always returned false idk why im dumb
  arr.forEach((elem: string) => {
    if (text.includes(elem)) {
      val = true
    }
})
return val
}


// idk what is this function I copied it from the previous fxmanifestmaker

function replaceLast(str: string, search: string, repl: string) {
  var a = str.split("");
  var length = search.length;
  if (str.lastIndexOf(search) != -1) {
      for (var i = str.lastIndexOf(search); i < str.lastIndexOf(search) + length; i++) {
          if (i == str.lastIndexOf(search)) {
              a[i] = repl;
          } else {
              delete a[i];
          }
      }
  }

  return a.join("");
}

export function format(arr: string[]): string[] {
  if (typeof arr == "object") {
      arr.forEach(entry => {
          arr[arr.indexOf(entry)] = replaceLast(entry, " ", "")
      })
      if (arr.length == 0) {
          arr.unshift('{');
          arr.push("}\n")
      } else {
          arr.unshift('{\n');
          arr.push("}\n")
      }
      return arr
  } else {
    return []
  }
}