import MyntClient from "~/MyntClient";
import { InfractionData } from "./Types";

export function splitArguments(argument: string, amount: number): string[] {
    const args = [];
    let element = "";
    let index = 0;

    while (index < argument.length) {
        if (args.length < amount - 1) {
            if (argument[index].match(/\s/)) {
                if (element.trim().length > 0) {
                    args.push(element.trim());
                }

                element = "";
            }
        }
        element += argument[index];
        index++;
    }

    if (element.trim().length > 0) {
        args.push(element.trim());
    }

    return args;
}

export async function pullInfractions(client: MyntClient): Promise<InfractionData[]> {
    const database = client.database;
    if (!database) {
        return [];
    }

    let cursor = database.infractions.find({ end: { "$lt": Date.now() + 60 * 60 * 24 } });
    cursor = cursor.sort([["end", 1], ["date", -1], ["_id", 1]]);

    const infractions = await cursor.toArray();

    return infractions.map(({ action, end = 0, user, guild }) => {
        return { action, end, user, guild };
    });
}

export function handleInfraction(infraction: InfractionData): void {
    console.log(infraction);
    return;
}
