import { ObjectId } from "bson";

interface Roles {
    muted?: string;
    moderator?: string[];
}

interface Logging {
    enabled: boolean;
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

interface Automod {
    enabled: boolean;
    filter?: Filter;
    antiAdvert?: boolean;
}

interface Filter {
    enabled: boolean;
    list?: string[];
}

interface Options {
    staffBypass?: boolean;
    dynamicLoggingTime?: boolean;
}

interface Config {
    prefix?: string;
    automod?: Automod;
    roles?: Roles;
    logging?: Logging;
    options?: Options;
}

export interface Guild {
    _id: ObjectId;
    id: string;
    config: Config;
}
