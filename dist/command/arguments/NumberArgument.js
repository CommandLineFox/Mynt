"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("../../utils/Utils");
class NumberArgument {
    toType(_event, message) {
        return Utils_1.splitMessage(message, (part) => {
            const value = Number(part);
            if (isNaN(value)) {
                return undefined;
            }
            return value;
        });
    }
}
exports.default = NumberArgument;
//# sourceMappingURL=NumberArgument.js.map