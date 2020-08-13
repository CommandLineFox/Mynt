import { splitMessage } from "../../utils/Utils";
export default class NumberArgument {
    toType(_event, message) {
        return splitMessage(message, (part) => {
            const value = Number(part);
            if (isNaN(value)) {
                return undefined;
            }
            return value;
        });
    }
}
//# sourceMappingURL=NumberArgument.js.map