import { string, base, array, object } from "~/ConfigHandler";

export default {
    token: string(""),
    prefix: string("!"),
    owners: array(base.string),
    staff: array(base.string),
    modlog: string(""),
    db: object({
        name: string(""),
        url: string("")
    })
}