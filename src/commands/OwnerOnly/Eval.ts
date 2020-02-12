import Command from "../../command/Command";
import { OwnerOnly } from "../../Groups";
import CommandEvent from "../../command/CommandEvent";
import util from "util";
import vm from "vm";
//import { RichEmbed } from "discord.js";

export default class Eval extends Command {
    constructor () {
        super({name: "Eval", triggers: ["eval", "evaluate"], description: "Runs given code", group: OwnerOnly});
    }

    async run(event: CommandEvent) {
        const client = event.client;
        const argument = event.argument;
        const message = event.message;
        try {
            function parseBlock(data: string) {
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
                const evaled = await vm.runInNewContext(code, { client, message });

                let func = evaled;
                if (typeof func !== "string") {
                    func = util.inspect(func);
                }

                if (func) {
                    /*const embed = new RichEmbed({
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
                    
                    });*/
                    console.log(client.format("```js\n{code}\n```", {
                        code: func.replace(token, "Secret")
                    }))
                    //message.channel.send(embed);
                }
            }
            else {
                return message.channel.send(
                    client.format("Failure", {
                    reason: "Parsing failure"
                    })
                );
            }
        }
        catch (err) {
            return console.error(err);
        }
    }
}