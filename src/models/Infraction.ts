import { ObjectId } from "bson";
import { InfractionAction } from "~/utils/Types";

export interface InfractionDoc {
    guild: string;
    user: string;
    id: number;
    end: number;
    action: InfractionAction;
}

export class Infraction implements InfractionDoc {
    public _id: ObjectId;
    public id: number;
    public guild: string;
    public user: string;
    public end: number;
    public action: InfractionAction;

    public constructor(data: InfractionDoc) {
        this._id = new ObjectId();
        this.id = data.id;
        this.guild = data.guild;
        this.user = data.user;
        this.end = data.end;
        this.action = data.action;
    }
}
