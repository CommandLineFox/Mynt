"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
class Database {
    constructor(config) {
        this.config = config;
    }
    async connect() {
        const client = await mongodb_1.connect(this.config.url, this.config.MongoOptions).catch(err => {
            throw err;
        });
        this.db = client.db(this.config.name);
    }
    get guilds() {
        return this.db.collection('guilds');
    }
    get users() {
        return this.db.collection('users');
    }
}
exports.Database = Database;
//# sourceMappingURL=Database.js.map