import { ObjectId } from "bson";

export interface GuildFilter {
    enabled?: boolean;
    list?: string[];
}

export interface GuildChannels {
    logging?: string;
    messagelog?: string;
    updatelog?: string;
    modlog?: string;
}

export interface GuildRoles {
    muted?: string;
    moderator?: string[];
}

export interface GuildConfig {
    prefix?: string;
    channels?: GuildChannels;
    roles?: GuildRoles;
    filter?: GuildFilter;
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