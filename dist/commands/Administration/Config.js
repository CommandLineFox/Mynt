"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = __importDefault(require("../../command/Command"));
const Groups_1 = require("../../Groups");
const Guild_1 = require("../../models/Guild");
class Config extends Command_1.default {
    constructor() {
        super({ name: "Config", triggers: ["config", "cfg", "setup"], description: "Configures various settings for the guild", group: Groups_1.Administration });
    }
    async run(event) {
        var _a, _b;
        const client = event.client;
        const database = client.database;
        let guild = await database.guilds.findOne({ id: event.guild.id });
        if (!guild) {
            const newguild = new Guild_1.Guild({ id: event.guild.id });
            await database.guilds.insertOne(newguild);
            guild = await database.guilds.findOne({ id: event.guild.id });
        }
        const args = event.argument.split(' ');
        const subcommand = (_a = args.shift()) === null || _a === void 0 ? void 0 : _a.trim();
        switch (subcommand) {
            case "prefix": {
                const prefix = (_b = args.shift()) === null || _b === void 0 ? void 0 : _b.trim();
                if (!prefix) {
                    event.send(`The prefix is currently set to \`${(guild === null || guild === void 0 ? void 0 : guild.config.prefix) || client.config.prefix}\``);
                    return;
                }
                if (prefix.length > 5) {
                    event.send("The prefix can be up to 5 characters.");
                    return;
                }
                if (prefix.toLowerCase() === "reset") {
                    database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild === null || guild === void 0 ? void 0 : guild.id }, { "$set": { "config.prefix": client.config.prefix } });
                    event.send(`The prefix has been set to \`${client.config.prefix}\``);
                    return;
                }
                database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild === null || guild === void 0 ? void 0 : guild.id }, { "$set": { "config.prefix": prefix } });
                event.send(`The prefix has been set to \`${args[1]}\``);
                break;
            }
        }
    }
}
exports.default = Config;
//# sourceMappingURL=Config.js.map