import Event from "@event/Event";
import MyntClient from "~/MyntClient";
import { Message } from "discord.js";

export const event = new Event("message", async (_client: MyntClient, _message: Message) => {

})