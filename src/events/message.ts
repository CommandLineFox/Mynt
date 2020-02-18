import Event from "../event/Event";
import MyntClient from "../MyntClient";
import { Message } from "discord.js";

export const event = new Event("message", async (_client: MyntClient, message: Message) => {
    try {
        if (message.author.id === '399624330268508162')
        message.reply('Hi');
    }
    catch (error) {
        console.log(error);
    }
})