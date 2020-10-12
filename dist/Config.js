import { string, base, array, object, boolean } from "./ConfigHandler";
export default {
    token: string(""),
    prefix: string("!"),
    owners: array(base.string),
    mail: string(""),
    db: object({
        name: string(""),
        url: string(""),
        mongoOptions: object({
            useUnifiedTopology: boolean(true)
        })
    })
};
//# sourceMappingURL=Config.js.map