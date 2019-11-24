import * as fs from "fs";
import configTemplate from "./Config";
import { generateConfig, getConfig } from "./ConfigHandler";
import MyntClient from "./MyntClient";

function main() {
    const configFile = "config.json";

    if(!fs.existsSync(configFile)) {
        generateConfig(configFile, configTemplate);
        console.warn("Generated config");
        console.info("Please edit the config before restarting the bot");
        return;
    }

    const config = getConfig(configFile, configTemplate);

    if(!config) {
        console.warn("Failed to read config");
        console.info("Please use the above errors to fix your config before restarting the bot");
        return;
    }

    const client = new MyntClient(config);
    client.login(config.token);
    
    client.on("ready", () => {
        console.log(`Logged in as ${client.user.tag}`);
        client.user.setActivity("with Alex", { type: "PLAYING" })
    })
}

main();