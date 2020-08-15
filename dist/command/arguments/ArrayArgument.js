"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ArrayArgument {
    constructor(argument) {
        this.argument = argument;
    }
    async toType(event, message) {
        const result = [];
        let value = await this.argument.toType(event, message, false);
        while (value[0] !== undefined) {
            result.push(value[0]);
            if (value[1] === undefined) {
                break;
            }
            value = await this.argument.toType(event, value[1], false);
        }
        return [result, value[1]];
    }
}
exports.default = ArrayArgument;
//# sourceMappingURL=ArrayArgument.js.map