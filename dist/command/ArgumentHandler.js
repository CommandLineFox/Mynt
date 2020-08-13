import ArrayArgument from "./arguments/ArrayArgument";
import BooleanArgument from "./arguments/BooleanArgument";
import GuildArgument from "./arguments/GuildArgument";
import MemberArgument from "./arguments/MemberArgument";
import NumberArgument from "./arguments/NumberArgument";
import StringArgument from "./arguments/StringArgument";
import UserArgument from "./arguments/UserArgument";
class ArgumentHandlerClass {
    constructor() {
        this.argumentTypes = new Map();
        this.addArgumentType("string", new StringArgument());
        this.addArgumentType("number", new NumberArgument());
        this.addArgumentType("boolean", new BooleanArgument());
        this.addArgumentType("user", new UserArgument());
        this.addArgumentType("member", new MemberArgument());
        this.addArgumentType("guild", new GuildArgument());
    }
    addArgumentType(type, argument) {
        this.argumentTypes.set(type, argument);
        this.argumentTypes.set(type + "?", argument);
        this.argumentTypes.set(type + "[]", new ArrayArgument(argument));
    }
    async getArguments(event, message, ...types) {
        const invalidTypes = types.filter((value) => !this.argumentTypes.has(value));
        if (invalidTypes.length > 0) {
            throw new TypeError("Invalid types: " + types.join(", "));
        }
        const iterator = types[Symbol.iterator]();
        const results = [];
        let currentIteration = iterator.next();
        let argument = message;
        while (!currentIteration.done) {
            const type = currentIteration.value;
            currentIteration = iterator.next();
            const isLast = currentIteration.done;
            const values = await this.argumentTypes.get(type).toType(event, argument, isLast);
            if ((values[1] === undefined && !isLast) || (values[0] === undefined && !type.endsWith("?"))) {
                return undefined;
            }
            results.push(values[0]);
            argument = values[1] === undefined ? "" : values[1];
        }
        return results;
    }
}
export default new ArgumentHandlerClass();
//# sourceMappingURL=ArgumentHandler.js.map