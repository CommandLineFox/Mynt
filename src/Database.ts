import { Collection, Db, MongoClient } from "mongodb";
import type { Guild } from "./models/Guild";
import type { Infraction } from "./models/Infraction";
import type { User } from "./models/User";

interface DatabaseConfig {
    name: string;
    url: string;
}

export class Database {
    public db!: Db;

    public constructor(protected config: DatabaseConfig) { }

    public async connect(): Promise<void> {
        const client = new MongoClient(this.config.url);
        await client.connect()
            .catch(error => {
                throw error;
            });
        this.db = client.db(this.config.name);
        console.log("Connected to database");
    }

    public async getGuild(id: string): Promise<Guild | null> {
        let guild = await this.guilds.findOne({ id: id });
        if (!guild) {
            const newGuild = ({ id: id, config: {} });
            await this.guilds.insertOne(newGuild);
            guild = await this.guilds.findOne({ id: id });
        }

        return guild;
    }

    public get guilds(): Collection<Guild> {
        return this.db.collection("guilds");
    }

    public get infractions(): Collection<Infraction> {
        return this.db.collection("infractions");
    }

    public get users(): Collection<User> {
        return this.db.collection("users");
    }
}
