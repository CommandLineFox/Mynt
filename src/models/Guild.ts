import { ObjectId } from "bson";

export interface Infraction {
    id: number;
    action: 'Warn' | 'Kick' | 'Mute' | 'Ban';
    user: string;
    moderator: string;
    reason: string;
    time: Date;
    active: boolean;
}
export interface Channels {
    logging?: string;
    messagelog?: string;
    updatelog?: string;
    modlog?: string;
    starboard?: string;
}

export interface Roles {
    muted?: string;
    moderator?: string;
}

export interface GuildConfig {
    prefix?: string;
    channels?: Channels;
    roles?: Roles;
}

export interface GuildDoc {
    id: string;
    config?: GuildConfig;
    infractions?: Infraction[];
}

export class Guild implements GuildDoc {
    _id: ObjectId;
    id: string;
    config: GuildConfig;
    infractions: Infraction[];

    constructor(data: GuildDoc) {
        this._id = new ObjectId();
        this.id = data.id;
        this.config = data.config ?? {};
        this.infractions = data.infractions ?? [];
    }
}