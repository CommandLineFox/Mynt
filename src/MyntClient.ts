import { Client, ClientOptions, User, Guild } from "discord.js";
import configTemplate from "./Config";
import { IFunctionType } from "./ConfigHandler";
import CommandHandler from "./command/CommandHandler"
type configTemplate = typeof configTemplate

export default class MyntClient extends Client {
    readonly config: { [key in keyof configTemplate]: IFunctionType<configTemplate[key]> };

    constructor(config: { [key in keyof configTemplate]: IFunctionType<configTemplate[key]> }, options?: ClientOptions) {
        super(options);
        this.config = config;
        this.once("ready", () => {
            new CommandHandler (this)
        });
    }

    isOwner(user: User): boolean {
        return this.config.owners.includes(user.id);
    }
    
    getPrefix(guild?: Guild): string {
        if (guild) {
            
        }
        return this.config.prefix;
    }
}