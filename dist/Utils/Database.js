"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
class Database {
    constructor(_client, database) {
        this.database = database;
    }
    getAll(collection) {
        return this.database.collection(collection).find().toArray();
    }
    getOne(collection, id) {
        return this.database.collection(collection).findOne({ id: id });
    }
    remove(collection, id) {
        this.database.collection(collection).findOneAndDelete({ id: id });
    }
    save(collection, data) {
        this.database.collection(collection).updateOne({ id: data.id }, data, { upsert: true });
    }
    static async getDatabase(config) {
        const { user, password, authenticationDatabase, shards } = config.database;
        function mongoUrlEncoder(str) {
            return str.replace(/@/g, "%40")
                .replace(/:/g, "%3A")
                .replace(/\//g, "%2F")
                .replace(/%/g, "%25");
        }
        const client = await (new mongodb_1.MongoClient(`mongodb://${mongoUrlEncoder(user)}:${mongoUrlEncoder(password)}@${shards.map(({ host, port }) => host + ":" + port).join(",")}/${authenticationDatabase}`, { useUnifiedTopology: true })).connect();
        const database = client.db(config.database.database);
        return new Database(client, database);
    }
}
exports.default = Database;
//# sourceMappingURL=Database.js.map