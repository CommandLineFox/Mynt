import { connect, Db, MongoClientOptions, Collection } from 'mongodb';
import { Guild } from '@models/Guild';

interface DatabaseConfig {
    url: string;
    name: string;
    MongoOptions?: MongoClientOptions;
}

export class Database {
    db!: Db;
    constructor(protected config: DatabaseConfig) { }

    async connect() {
        const client = await connect(this.config.url, this.config.MongoOptions)
            .catch(err => {
                throw err;
            });
        this.db = client.db(this.config.name);
        console.log("Connected to database");
    }

    get guilds(): Collection<Guild> {
        return this.db.collection('guilds');
    }
}