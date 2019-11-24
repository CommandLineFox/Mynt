import { string, base, array} from "./ConfigHandler";

export default {
    token: string(""),
    prefix: string("!"),
    owners: array(base.string),
    modlog: string("")
}