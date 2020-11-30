import {ObjectId} from "bson";

export interface Roles {
    muted?: string;
    moderator?: string[];
}

export interface Channels {
    editLogs?: string;
    bulkDeletes?: string;
    modActions?: string;
    commandUsed?: string;
    nameChanges?: string;
    roleUpdates?: string;
    guildChanges?: string;
    channelChanges?: string;
    voiceChanges?: string;
    joinLogs?: string;
}

export interface Filter {
    enabled: boolean;
    list?: string[];
}

export interface GuildConfig {
    prefix?: string;
    logging?: boolean;
    automod?: boolean;
    roles?: Roles;
    channels?: Channels;
    filter?: Filter;
    inviteBlocker?: boolean;
    staffBypass?: boolean;
}

export interface GuildDoc {
    id: string;
    config?: GuildConfig;
}

export class Guild implements GuildDoc {
    public _id: ObjectId;
    public id: string;
    public config: GuildConfig;

    public constructor(data: GuildDoc) {
        this._id = new ObjectId();
        this.id = data.id;
        this.config = data.config ?? {};
    }
}
