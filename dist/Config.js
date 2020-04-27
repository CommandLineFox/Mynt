"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ConfigHandler_1 = require("./ConfigHandler");
exports.default = {
    token: ConfigHandler_1.string(""),
    prefix: ConfigHandler_1.string("!"),
    owners: ConfigHandler_1.array(ConfigHandler_1.base.string),
    staff: ConfigHandler_1.array(ConfigHandler_1.base.string),
    modlog: ConfigHandler_1.string(""),
    db: ConfigHandler_1.object({
        name: ConfigHandler_1.string(""),
        url: ConfigHandler_1.string("")
    }),
    database: ConfigHandler_1.object({
        user: ConfigHandler_1.string(""),
        password: ConfigHandler_1.string(""),
        database: ConfigHandler_1.string(""),
        authenticationDatabase: ConfigHandler_1.string("admin"),
        shards: ConfigHandler_1.objectArray({
            host: ConfigHandler_1.string("localhost"),
            port: ConfigHandler_1.number(27017)
        })
    })
};
//# sourceMappingURL=Config.js.map