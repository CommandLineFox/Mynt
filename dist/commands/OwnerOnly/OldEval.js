"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = __importDefault(require("../../command/Command"));
const Groups_1 = require("../../Groups");
const util_1 = __importDefault(require("util"));
const vm_1 = __importDefault(require("vm"));
const discord_js_1 = require("discord.js");
class Eval extends Command_1.default {
    constructor() {
        super({ name: "Eval", triggers: ["eval", "evaluate"], description: "Runs given code", group: Groups_1.OwnerOnly });
    }
    async run(event) {
        const client = event.client;
        const argument = event.argument;
        const message = event.message;
        try {
            function parseBlock(data) {
                if (data.startsWith("```") && data.endsWith("```")) {
                    const removeBlock = data.replace("```", "").replace("```", "");
                    if (removeBlock.startsWith("js")) {
                        return removeBlock.replace("js", "");
                    }
                    return removeBlock;
                }
                return data;
            }
            const token = new RegExp(client.token, "g");
            const code = parseBlock(argument);
            if (code) {
                const evaled = await vm_1.default.runInNewContext(code, { client, message });
                let func = evaled;
                if (typeof func !== "string") {
                    func = util_1.default.inspect(func);
                }
                if (func) {
                    const embed = new discord_js_1.RichEmbed({
                        fields: [
                            {
                                name: "Input",
                                value: client.format("```js\n${code}\n```", { code })
                            },
                            {
                                name: "Output",
                                value: client.format("```js\n{code}\n```", {
                                    code: func.replace(token, "Secret")
                                })
                            }
                        ]
                    });
                    message.channel.send(embed);
                }
            }
            else {
                return message.channel.send(client.format("Failure", {
                    reason: "Parsing failure"
                }));
            }
        }
        catch (err) {
            return console.error(err);
        }
    }
}
exports.default = Eval;
//# sourceMappingURL=OldEval.js.map