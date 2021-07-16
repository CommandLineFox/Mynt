import { ObjectId } from "bson";

interface Roles {
    muted?: string;
    moderator?: string[];
}

interface Channels {
    editLogs?: string;
    bulkDeletes?: string;
    modActions?: string;
    commandUsed?: string;
    nameChanges?: string;
    roleChanges?: string;
    guildChanges?: string;
    channelChanges?: string;
    voiceChanges?: string;
    travelLogs?: string;
}

interface Filter {
    enabled: boolean;
    list?: string[];
}

interface GuildConfig {
    prefix?: string;
    logging?: boolean;
    automod?: boolean;
    roles?: Roles;
    channels?: Channels;
    filter?: Filter;
    antiAdvert?: boolean;
    staffBypass?: boolean;
}

export interface Guild {
    _id: ObjectId;
    id: string;
    config: GuildConfig;
}
