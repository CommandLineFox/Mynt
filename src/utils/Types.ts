export type DatabaseCheckOption = "roles" | "moderator" | "channels" | "automod" | "filter" | "overwrites" | "inviteblocker";
export type MutePermissionOption = "set" | "remove";
export type InfractionAction = "Warn" | "Kick" | "Mute" | "Unmute" | "Ban" | "Unban";
export type DisplayData = "prefix" | "moderators" | "muterole" | "automod" | "filter" | "logging" | "overwrites" | "inviteblocker";
export type LoggingType = "editLogs" | "bulkDelete" | "modActions" | "commandUsed" | "nameChanges" | "roleUpdates" | "guildChanges" | "channelChanges" | "voiceChanges" | "joinLogs";