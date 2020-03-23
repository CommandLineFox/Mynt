import { string, base, array, object, objectArray, number } from "~/ConfigHandler";

export default {
    token: string(""),
    prefix: string("!"),
    owners: array(base.string),
    staff: array(base.string),
    modlog: string(""),
    database: object({
        user: string(""),
        password: string(""),
        database: string(""),
        authenticationDatabase: string("admin"),
        shards: objectArray({
            host: string("localhost"),
            port: number(27017)
        })
    })
}