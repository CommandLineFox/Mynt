import { ObjectId } from "bson";

export interface User {
    _id: ObjectId;
    id: string;
}
