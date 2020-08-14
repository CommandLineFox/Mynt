import { connect } from 'mongodb';
export class Database {
    constructor(config) {
        this.config = config;
    }
    async connect() {
        const client = await connect(this.config.url, this.config.MongoOptions)
            .catch(err => {
            throw err;
        });
        this.db = client.db(this.config.name);
        console.log("Connected to database");
    }
    get guilds() {
        return this.db.collection('guilds');
    }
    get users() {
        return this.db.collection('users');
    }
}
//# sourceMappingURL=Database.js.map