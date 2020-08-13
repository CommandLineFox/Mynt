import { splitMessage } from "../../utils/Utils";
export default class BooleanArgument {
    toType(_event, message) {
        return splitMessage(message, (part) => {
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
//# sourceMappingURL=BooleanArgument.js.map