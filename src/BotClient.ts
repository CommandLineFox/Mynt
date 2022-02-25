import { Client, ClientOptions } from "discord.js";
import type { Config } from "./Config";
import type { Database } from "./Database";
import EventHandler from "./event/EventHandler";

export class BotClient extends Client {
    public readonly config: Config;
    public readonly database: Database;

    public constructor(config: Config, database: Database, options: ClientOptions) {
        super(options);
        this.config = config;
        this.database = database;

        new EventHandler(this);
    }
}
