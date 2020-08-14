import { ObjectId } from 'bson';

export interface UserInfraction {
    action: 'Warn' | 'Kick' | 'Mute' | 'Ban';
    active: boolean;
    guild: string;
    id: number;
    moderator: string;
    reason: string;
    time: Date;
}
export interface UserDoc {
    blacklisted?: boolean;
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