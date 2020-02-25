"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("../../utils/Utils");
class StringArgument {
    async toType(_event, message, isLast) {
        if (isLast) {
            return [message, undefined];
        }
        if (message.startsWith("'") || message.startsWith("\"")) {
            const iterator = message[Symbol.iterator]();
            const quote = iterator.next().value;
            let value = "";
            let finished = false;
            let escaped = false;
            let currentIteration = iterator.next();
            while (!currentIteration.done) {
                const char = currentIteration.value;
                currentIteration = iterator.next();
                if (!escaped && char === quote) {
                    finished = true;
                    break;
                }
                if (escaped) {
                    escaped = false;
                }
                else if (char === "\\") {
                    escaped = true;
                    continue;
                }
                value += char;
            }
            if (finished) {
                return [value, Utils_1.getArgument(message, value.length + 2)];
            }
        }
        return Utils_1.splitMessage(message, (part) => part);
    }
}
exports.default = StringArgument;
//# sourceMappingURL=StringArgument.js.map