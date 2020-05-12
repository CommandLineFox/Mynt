import { splitMessage } from "@utils/Utils";
import CommandEvent from "@command/CommandEvent";
import Argument from "@command/IArgument";

export default class NumberArgument implements Argument<number> {
    public toType(_event: CommandEvent, message: string): Promise<[number?, string?]> {
        return splitMessage(message, (part) => {
            const value = Number(part);
            if (isNaN(value)) {
                return undefined;
            }
            return value;
        });
    }
}