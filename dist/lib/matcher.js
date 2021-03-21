"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileEntry = void 0;
const pattern = /(?<=TYPE:).*/;
const fs_1 = __importDefault(require("fs"));
const pth = __importStar(require("path"));
async function getFileEntry(path, filenameing) {
    return new Promise((resolve, reject) => {
        // extract based on filenaming
        const baseName = pth.basename(path);
        if (baseName.includes("index.html") && filenameing) {
            resolve({ entry: "UIP", isEntry: true });
            return 0;
        } // if the file is named index.html then its automatically assigned as the UI page
        if (baseName.includes("CL") && filenameing) {
            resolve({ entry: "CL", isEntry: true });
            return 0;
        }
        if (baseName.includes("SV") && filenameing) {
            resolve({ entry: "SV", isEntry: true });
            return 0;
        }
        if (baseName.includes("SH") && filenameing) {
            resolve({ entry: "SH", isEntry: true });
            return 0;
        }
        if (baseName.includes("FL") && filenameing) {
            resolve({ entry: "FILE", isEntry: true });
            return 0;
        }
        fs_1.default.promises.readFile(path).then((file) => {
            const parsed = file.toString();
            let result = parsed.match(pattern);
            if (result) {
                result = result.toString().replace(/\s/g, "");
            }
            if (["SV", "CL", "SH", "UIP", "FILE"].includes(result)) {
                resolve({ entry: result, isEntry: true });
            }
            else {
                resolve({ entry: result, isEntry: false });
            }
        });
    });
}
exports.getFileEntry = getFileEntry;
//# sourceMappingURL=matcher.js.map