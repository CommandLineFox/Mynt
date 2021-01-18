import { ObjectId } from "bson";
import { InfractionAction } from "~/utils/Types";

export interface InfractionDoc {
    action: InfractionAction;
    guild: string;
    user: string;
    moderator: string;
    reason: string;
    date: number;
    end?: number;
}

export class Infraction implements InfractionDoc {
    public _id: ObjectId;
    public action: InfractionAction;
    public guild: string;
    public user: string;
    public moderator: string;
    public reason: string;
    public date: number;
    public end?: number;

    public constructor(data: InfractionDoc) {
        this._id = new ObjectId();
        this.action = data.action;
        this.guild = data.guild;
        this.user = data.user;
        this.moderator = data.moderator;
        this.reason = data.reason;
        this.date = data.date;
        this.end = data.end ?? undefined;
    }
}
