"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ArrayArgument_1 = __importDefault(require("./arguments/ArrayArgument"));
const BooleanArgument_1 = __importDefault(require("./arguments/BooleanArgument"));
const GuildArgument_1 = __importDefault(require("./arguments/GuildArgument"));
const MemberArgument_1 = __importDefault(require("./arguments/MemberArgument"));
const NumberArgument_1 = __importDefault(require("./arguments/NumberArgument"));
const StringArgument_1 = __importDefault(require("./arguments/StringArgument"));
const UserArgument_1 = __importDefault(require("./arguments/UserArgument"));
class ArgumentHandlerClass {
    constructor() {
        this.argumentTypes = new Map();
        this.addArgumentType("string", new StringArgument_1.default());
        this.addArgumentType("number", new NumberArgument_1.default());
        this.addArgumentType("boolean", new BooleanArgument_1.default());
        this.addArgumentType("user", new UserArgument_1.default());
        this.addArgumentType("member", new MemberArgument_1.default());
        this.addArgumentType("guild", new GuildArgument_1.default());
    }
    addArgumentType(type, argument) {
        this.argumentTypes.set(type, argument);
        this.argumentTypes.set(type + "?", argument);
        this.argumentTypes.set(type + "[]", new ArrayArgument_1.default(argument));
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
exports.default = new ArgumentHandlerClass();
//# sourceMappingURL=ArgumentHandler.js.map