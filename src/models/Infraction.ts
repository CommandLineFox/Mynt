import { ObjectId } from "bson";
import { InfractionAction } from "~/utils/Types";

export interface Infraction {
    _id: ObjectId;
    action: InfractionAction;
    guild: string;
    user: string;
    moderator: string;
    reason: string;
    date: number;
    complete: boolean;
    end?: number;
}
