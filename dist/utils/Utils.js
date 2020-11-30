"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitArguments = void 0;
function splitArguments(argument, amount) {
    const args = [];
    let element = "";
    let index = 0;
    while (index < argument.length) {
        if (args.length < amount - 1) {
            if (argument[index].match(/\s/)) {
                if (element.trim().length > 0) {
                    args.push(element.trim());
                }
                element = "";
            }
        }
        element += argument[index];
        index++;
    }
    if (element.trim().length > 0) {
        args.push(element.trim());
    }
    return args;
}
exports.splitArguments = splitArguments;
//# sourceMappingURL=Utils.js.map