"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = __importDefault(require("../../command/Command"));
const Groups_1 = require("../../Groups");
const discord_js_1 = require("discord.js");
const util_1 = require("util");
const vm_1 = require("vm");
function makeCodeBlock(data, lang) {
    return `\`\`\`${lang}\n${data}\n\`\`\``;
}
class Eval extends Command_1.default {
    constructor() {
        super({ name: "Eval", triggers: ["eval", "evaluate"], description: "Runs given code", group: Groups_1.OwnerOnly });
    }
    async run(event) {
        var _a;
        const client = event.client;
        const message = event.message;
        const argument = event.argument;
        const author = event.author;
        const start = Date.now();
        const script = parseBlock(argument);
        const exec = await run(script, { client, message, RichEmbed: discord_js_1.RichEmbed, author, }, { filename: (_a = message.guild) === null || _a === void 0 ? void 0 : _a.id.toString() });
        const end = Date.now();
        if (typeof exec === 'string') {
            const embed = new discord_js_1.RichEmbed()
                .addField('Input', makeCodeBlock(script, 'js'))
                .addField('Output', makeCodeBlock(exec, 'js'))
                .setFooter(`Script Executed in ${end - start}ms`);
            event.send(embed);
        }
        else {
            const embed = new discord_js_1.RichEmbed()
                .addField('Input', makeCodeBlock(script, 'js'))
                .addField('Output', makeCodeBlock(`${exec.name}: ${exec.message}`))
                .setFooter(`Script Executed in ${end - start}ms`);
            event.send(embed);
        }
    }
}
exports.default = Eval;
async function run(script, ctx, opts) {
    try {
        const result = await vm_1.runInNewContext(`(async () => { ${script} })()`, ctx, opts);
        if (typeof result !== 'string') {
            return util_1.inspect(result);
        }
        return result;
    }
    catch (err) {
        return err;
    }
}
function parseBlock(script) {
    var _a, _b;
    const cbr = /^(([ \t]*`{3,4})([^\n]*)([\s\S]+?)(^[ \t]*\2))/gm;
    const result = cbr.exec(script);
    return _b = (_a = result) === null || _a === void 0 ? void 0 : _a[4], (_b !== null && _b !== void 0 ? _b : script);
}
//# sourceMappingURL=Eval.js.map