import { string, base, array, object, boolean, optional } from "~/ConfigHandler";

export default {
    token: string(""),
    prefix: string("!"),
    owners: array(base.string),
    options: object({
        disableMentions: optional(base.string) 
    }),
    mail: string(""),
    errors: string(""),
    emotes: array(base.string),
    db: object({
        name: string(""),
        url: string(""),
        mongoOptions: object({
            useUnifiedTopology: boolean(true)
        })
    })
};
