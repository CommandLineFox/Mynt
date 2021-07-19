
export type DatabaseCheckOption = "roles" | "moderator" | "logging" | "automod" | "filter" | "overwrites" | "antiadvert";
export type InfractionAction = "Warn" | "Kick" | "Mute" | "Unmute" | "Ban" | "Unban";
export type DisplayData = "prefix" | "moderators" | "muterole" | "automod" | "filter" | "logging" | "overwrites" | "antiadvert";
export type LoggingType = "editLogs" | "bulkDeletes" | "modActions" | "commandUsed" | "nameChanges" | "roleChanges" | "guildChanges" | "channelChanges" | "voiceChanges" | "travelLogs";

export interface Attachment {
    file: string;
    name: string;
}

export interface Log {
    channel: string;
    content: string;
    attachment?: Attachment;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function iterator(array: any[]) {
    let index = 0;

    const iterator = {
        next: () => {
            if (index < array.length) {
                const result = array[index];
                index += 1;
                return result;
            }

            return;
        },
        hasNext: () => {
            if (index + 1 <= array.length) {
                return true;
            }

            return false;
        }
    };

    return iterator;
}
