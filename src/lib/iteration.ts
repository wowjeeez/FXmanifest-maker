import fs from "fs"
import path from "path"

/**
 * Returns an iterator of a directory
 */

 export async function* getFiles(dir: string): any {
  const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = path.resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* getFiles(res);
    } else {
      yield res;
    }
  }
}

