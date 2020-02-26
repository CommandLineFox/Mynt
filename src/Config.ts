import { string, base, array, object } from "~/ConfigHandler";

export default {
    token: string(""),
    prefix: string("!"),
    owners: array(base.string),
    staff: array(base.string),
    modlog: string(""),
    database: object({
        url: string(""),
        name: string(""),
        MongoOptions: object({
            useNewUrlParser: string(""),
            useUnifiedTopology: string("")
        })
    })
}