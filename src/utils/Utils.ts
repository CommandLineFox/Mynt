import { Infraction } from "@models/Infraction";
import MyntClient from "~/MyntClient";

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

export async function pullInfractions(client: MyntClient): Promise<Infraction[]> {
    const database = client.database;
    if (!database) {
        return [];
    }

    const cursor = database.infractions.find({ end: { "$lt": Date.now() + 60 * 60 * 24 } });
    cursor.sort("end", 1);
    const infractions = await cursor.toArray();
    return infractions;
}
