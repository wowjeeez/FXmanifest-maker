"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDataFile = void 0;
const path_1 = __importDefault(require("path"));
function handleDataFile(file, type, root) {
    if (type) {
        const name = path_1.default.basename(file);
        type = type.replace("-->", "");
        const relpath = path_1.default.relative(root, file).replace(/\\/g, "/");
        const final = `data_file '${type}' '${relpath}'`;
        return { isDataFile: true, entry: final, path: "'" + relpath + "'," };
    }
    return { isDataFile: false };
}
exports.handleDataFile = handleDataFile;
//# sourceMappingURL=datafiles.js.map