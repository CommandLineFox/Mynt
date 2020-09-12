import { ObjectId } from "bson";

export interface Channels {
    logging?: string;
    messagelog?: string;
    updatelog?: string;
    modlog?: string;
}

export interface Roles {
    muted?: string;
    moderator?: string[];
}

export interface GuildConfig {
    prefix?: string;
    channels?: Channels;
    roles?: Roles;
}

export interface GuildDoc {
    id: string;
    config?: GuildConfig;
}

export class Guild implements GuildDoc {
    _id: ObjectId;
    id: string;
    config: GuildConfig;

    constructor(data: GuildDoc) {
        this._id = new ObjectId();
        this.id = data.id;
        this.config = data.config ?? {};
    }
}