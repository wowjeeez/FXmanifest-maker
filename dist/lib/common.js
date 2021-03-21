"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSubInArray = void 0;
function isSubInArray(arr, text) {
    let val = false; //if I didnt utilize this var it always returned false idk why im dumb
    arr.forEach((elem) => {
        if (text.includes(elem)) {
            val = true;
        }
    });
    return val;
}
exports.isSubInArray = isSubInArray;
//# sourceMappingURL=common.js.map