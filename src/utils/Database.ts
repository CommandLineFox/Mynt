import { connect, Db, MongoClientOptions, Collection } from "mongodb";
import { Guild } from "@models/Guild";
import { User } from "@models/User";

interface DatabaseConfig {
    url: string;
    name: string;
    mongoOptions?: MongoClientOptions;
}

export class Database {
    db!: Db;
    constructor(protected config: DatabaseConfig) { }

    async connect() {
        const client = await connect(this.config.url, this.config.mongoOptions)
            .catch(err => {
                throw err;
            });
        this.db = client.db(this.config.name);
        console.log("Connected to database");
    }

    get guilds(): Collection<Guild> {
        return this.db.collection("guilds");
    }
    
    get users(): Collection<User> {
        return this.db.collection("users");
    }
}