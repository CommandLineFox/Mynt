import { ObjectId } from "bson";

export interface UserDoc {
    id: string;
}

export class User implements UserDoc {
    public _id: ObjectId;
    public id: string;

    public constructor(data: UserDoc) {
        this._id = new ObjectId();
        this.id = data.id;
    }
}
