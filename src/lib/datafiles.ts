import fs from "fs"
import path from "path"
import { DataFile } from "../typings";
import {isSubInArray} from "./"

export function handleDataFile(file: string, type: string, root: string): { isDataFile: boolean, entry?: DataFile, path?: string} {
  if (type) {
    const name = path.basename(file)
    type = type.replace("-->", "")
    const relpath = path.relative(root, file).replace(/\\/g, "/")
    const final = `data_file '${type}' '${relpath}'`
    return {isDataFile: true, entry: final, path: "'" + relpath + "',"}

  }
  
  return {isDataFile: false}
}