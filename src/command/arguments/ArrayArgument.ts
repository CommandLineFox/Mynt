import CommandEvent from "@command/CommandEvent";
import Argument from "@command/IArgument";

export default class ArrayArgument<T> implements Argument<T[]> {
    private readonly argument: Argument<T>;

    constructor(argument: Argument<T>) {
        this.argument = argument;
    }

    public async toType(event: CommandEvent, message: string): Promise<[T[], string?]> {
        const result: T[] = [];
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