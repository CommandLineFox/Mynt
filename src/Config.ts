import { string, base, array, object } from "~/ConfigHandler";

export default {
    token: string(""),
    prefix: string("!"),
    owners: array(base.string),
    staff: array(base.string),
    modlog: string(""),
    database: object({
        name: string("Mynt"),
        url: string("")
    })
}