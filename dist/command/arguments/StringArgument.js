import { getArgument, splitMessage } from "../../utils/Utils";
export default class StringArgument {
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
                return [value, getArgument(message, value.length + 2)];
            }
        }
        return splitMessage(message, (part) => part);
    }
}
//# sourceMappingURL=StringArgument.js.map