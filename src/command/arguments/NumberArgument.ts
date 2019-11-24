
import {splitMessage} from "../../Utils/Utils";
import CommandEvent from "../CommandEvent";
import Argument from "../IArgument";

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