const pattern = /(?<=TYPE:).*/
import { EntryType } from "../typings";
import fs from "fs";
import * as pth from "path";

export async function getFileEntry(path: string, filenameing: boolean): Promise<{entry: EntryType, isEntry: boolean}>   {
  return new Promise<{entry: EntryType, isEntry: boolean}>((resolve, reject) => {
    // extract based on filenaming
    const baseName = pth.basename(path)
    if (baseName.includes("index.html") && filenameing) { resolve({entry: "UIP", isEntry: true}); return 0 } // if the file is named index.html then its automatically assigned as the UI page
    if (baseName.includes("CL") && filenameing) { resolve({entry: "CL", isEntry: true}); return 0 }
    if (baseName.includes("SV") && filenameing) { resolve({entry: "SV", isEntry: true}); return 0 }
    if (baseName.includes("SH") && filenameing) { resolve({entry: "SH", isEntry: true}); return 0 }
    if (baseName.includes("FL") && filenameing) { resolve({entry: "FILE", isEntry: true}); return 0 }

    fs.promises.readFile(path).then((file: Buffer) => {
      const parsed = (file as any).toString()
      let result = parsed.match(pattern)
        if (result) {
          result = result.toString().replace(/\s/g, "")
        }
        if (["SV", "CL", "SH", "UIP", "FILE"].includes(result)) {
          resolve({ entry: result, isEntry: true })
        } else {
          resolve({ entry: result, isEntry: false })
        }
      
   
    })
  })
}