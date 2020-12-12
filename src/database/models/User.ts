import { ObjectId } from "bson";
import { InfractionAction } from "@utils/Types";

export interface UserInfraction {
    action: InfractionAction;
    active: boolean;
    guild: string;
    id: number;
    moderator: string;
    reason: string;
    time: Date;
}

export interface UserDoc {
    id: string;
    infractions?: UserInfraction[];
}

export class User implements UserDoc {
    public _id: ObjectId;
    public id: string;
    public infractions: UserInfraction[];

    public constructor(data: UserDoc) {
        this._id = new ObjectId();
        this.id = data.id;
        this.infractions = data.infractions ?? [];
    }
}
