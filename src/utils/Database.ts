import configTemplate from "../Config";
import { IFunctionResult } from "../ConfigHandler";
import { MongoClient, Db } from "mongodb";

export default class Database {
    //private readonly client: MongoClient;
    private readonly database: Db;

    private constructor (_client: MongoClient, database: Db) {
        //this.client = client;
        this.database = database;
    }
    
    public getAll(collection: string): Promise<object[]> {
        return this.database.collection(collection).find().toArray();
    }
    
    public getOne(collection: string, id: string): Promise<object | null> {
        return this.database.collection(collection).findOne({ id: id });
    }
    
    public remove(collection: string, id: string) {
        this.database.collection(collection).findOneAndDelete({ id: id });
    }
    
    public save(collection: string, data: {[key: string]: any, id: string}): void {
        this.database.collection(collection).updateOne({ id: data.id }, data, { upsert: true});
    }
    
    public static async getDatabase(config: IFunctionResult<typeof configTemplate>): Promise<Database> {
        const { user, password, authenticationDatabase, shards } = config.database;
        function mongoUrlEncoder(str: string) {
            return str.replace(/@/g, "%40")
                      .replace(/:/g, "%3A")
                      .replace(/\//g, "%2F")
                      .replace(/%/g, "%25")
        }
        
        const client = await (new MongoClient(`mongodb://${mongoUrlEncoder(user)}:${mongoUrlEncoder(password)}@${shards.map(({host, port}) => host + ":" + port).join(",")}/${authenticationDatabase}`, { useUnifiedTopology: true })).connect();
        const database = client.db(config.database.database);

        return new Database(client, database);
    }
}