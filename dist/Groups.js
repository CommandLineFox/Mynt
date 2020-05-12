"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Group_1 = __importDefault(require("./command/Group"));
exports.Basic = new Group_1.default({ name: "Basic", description: "" });
exports.ModMail = new Group_1.default({ name: "Mod Mail", description: "", guildOnly: true, modOnly: true });
exports.Moderation = new Group_1.default({ name: "Moderation", description: "", guildOnly: true, modOnly: true });
exports.Administration = new Group_1.default({ name: "Administration", description: "", guildOnly: true, adminOnly: true });
exports.OwnerOnly = new Group_1.default({ name: "Owner Only", description: "", ownerOnly: true });
//# sourceMappingURL=Groups.js.map