import { splitMessage } from "@utils/Utils";
import CommandEvent from "@command/CommandEvent";
import Argument from "@command/IArgument";

export default class BooleanArgument implements Argument<boolean> {
    public toType(_event: CommandEvent, message: string): Promise<[boolean?, string?]> {
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