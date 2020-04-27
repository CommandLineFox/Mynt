"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("../../utils/Utils");
class BooleanArgument {
    toType(_event, message) {
        return Utils_1.splitMessage(message, (part) => {
            if (["yes", "y", "enable", "true", "t", "1"].includes(part)) {
                return true;
            }
            else if (["no", "n", "disable", "false", "f", "0"].includes(part)) {
                return false;
            }
            else {
                return undefined;
            }
        });
    }
}
exports.default = BooleanArgument;
//# sourceMappingURL=BooleanArgument.js.map