import Command from "../../command/Command";
import { OwnerOnly } from "../../Groups";
import { MessageEmbed } from "discord.js";
import { inspect } from "util";
import { runInNewContext } from "vm";
export default class Eval extends Command {
    constructor() {
        super({ name: "Eval", triggers: ["eval", "evaluate"], description: "Runs given code", group: OwnerOnly });
    }
    async run(event) {
        var _a;
        const client = event.client;
        const message = event.message;
        let argument = event.argument;
        const author = event.author;
        const start = Date.now();
        if (argument.startsWith("```js") && argument.endsWith("```")) {
            argument = argument.slice(5, argument.length - 3);
        }
        const script = parseBlock(argument);
        const exec = await run(script, { client, message, MessageEmbed, author, }, { filename: (_a = message.guild) === null || _a === void 0 ? void 0 : _a.id.toString() });
        const end = Date.now();
        if (typeof exec === "string") {
            const embed = new MessageEmbed()
                .addField("Input", makeCodeBlock(script, "js"))
                .addField("Output", makeCodeBlock(exec, "js"))
                .setFooter(`Script Executed in ${end - start}ms`);
            event.send({ embed: embed });
        }
        else {
            const embed = new MessageEmbed()
                .addField("Input", makeCodeBlock(script, "js"))
                .addField("Output", makeCodeBlock(`${exec.name}: ${exec.message}`))
                .setFooter(`Script Executed in ${end - start}ms`);
            event.send(embed);
        }
    }
}
async function run(script, ctx, opts) {
    try {
        const result = await runInNewContext(`(async () => { ${script} })()`, ctx, opts);
        if (typeof result !== "string") {
            return inspect(result);
        }
        return result;
    }
    catch (err) {
        return err;
    }
}
function parseBlock(script) {
    var _a;
    const cbr = /^(([ \t]*`{3,4})([^\n]*)([\s\S]+?)(^[ \t]*\2))/gm;
    const result = cbr.exec(script);
    return (_a = result === null || result === void 0 ? void 0 : result[4]) !== null && _a !== void 0 ? _a : script;
}
function makeCodeBlock(data, lang) {
    return `\`\`\`${lang}\n${data}\n\`\`\``;
}
//# sourceMappingURL=Eval.js.map