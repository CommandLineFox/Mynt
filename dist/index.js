"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const Config_1 = __importDefault(require("./Config"));
const ConfigHandler_1 = require("./ConfigHandler");
const MyntClient_1 = __importDefault(require("./MyntClient"));
const _database_1 = require("./database/Database.ts");
async function main() {
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
    const database = new _database_1.Database(config.db);
    await database.connect();
    const client = new MyntClient_1.default(config, database);
    await client.login(config.token);
}
main().catch((err) => {
    console.log(err);
});
//# sourceMappingURL=index.js.map