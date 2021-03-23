import { ObjectId } from "bson";

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
    inviteLogging?: boolean;
}

export interface Guild {
    _id: ObjectId;
    id: string;
    config: GuildConfig;
    invites?: []
}
