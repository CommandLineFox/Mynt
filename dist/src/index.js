"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const Config_1 = __importDefault(require("../Config"));
const ConfigHandler_1 = require("../ConfigHandler");
const MyntClient_1 = __importDefault(require("../MyntClient"));
function main() {
    const configFile = "config.json";
    if (!fs.existsSync(configFile)) {
        ConfigHandler_1.generateConfig(configFile, Config_1.default);
        console.warn("Generated config");
        console.info("Please edit the config before restarting the bot");
        return;
    }
    const config = ConfigHandler_1.getConfig(configFile, Config_1.default);
    if (!config) {
        console.warn("Failed to read config");
        console.info("Please use the above errors to fix your config before restarting the bot");
        return;
    }
    const client = new MyntClient_1.default(config);
    client.db.connect()
        .then(() => {
        console.log("Connected to the Database");
    })
        .catch((err) => {
        console.log(err);
    });
    client.login(config.token);
    client.on("ready", () => {
        console.log(`Logged in as ${client.user.tag}`);
        client.user.setActivity("with Alex", { type: "PLAYING" });
    });
}
main();
//# sourceMappingURL=index.js.map