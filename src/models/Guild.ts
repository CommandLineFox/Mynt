import { ObjectId } from "bson";
import { EventName } from "@utils/Types";

export interface Overwrites {
    staffbypass: boolean;
}

export interface Filter {
    enabled: boolean;
    list?: string[];
}

export interface AutoMod {
    enabled: boolean;
    filter?: Filter;
}

export interface LoggingEvent {
    enabled: boolean;
    name: EventName;
    channel: string;
}

export interface Logging {
    enabled: boolean;
    events?: LoggingEvent[];
}

export interface Roles {
    muted?: string;
    moderator?: string[];
}

export interface GuildConfig {
    prefix?: string;
    roles?: Roles;
    automod?: AutoMod;
    logging?: Logging;
    overwrites?: Overwrites;
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