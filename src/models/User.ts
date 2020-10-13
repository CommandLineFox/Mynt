import { ObjectId } from "bson";
import { Action } from "@utils/Types";

export interface UserInfraction {
    action: Action;
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
    _id: ObjectId;
    id: string;
    infractions: UserInfraction[];
    constructor(data: UserDoc) {
        this._id = new ObjectId();
        this.id = data.id;
        this.infractions = data.infractions ?? [];
    }
}