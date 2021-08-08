import { string, base, array, object, boolean, optional, optionalArray, number } from "~/ConfigHandler";

export default {
    token: string(""),
    prefix: string("!"),
    owners: array(base.string),
    options: object({
        disableMentions: optional(base.string),
        partials: optionalArray(base.string),
        intents: optionalArray(base.string)
    }),
    mail: string(""),
    errors: string(""),
    intervals: object({
        moderation: number(0),
        logging: number(0)
    }),
    db: object({
        name: string(""),
        url: string(""),
        mongoOptions: object({
            useUnifiedTopology: boolean(true)
        })
    })
};
