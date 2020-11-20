"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OwnerOnly = exports.Administration = exports.Moderation = exports.Mail = exports.Basic = void 0;
const Group_1 = __importDefault(require("./command/Group"));
exports.Basic = new Group_1.default({ name: "Basic", description: "" });
exports.Mail = new Group_1.default({ name: "Mail", description: "", guildOnly: true, ownerOnly: true });
exports.Moderation = new Group_1.default({ name: "Moderation", description: "", guildOnly: true, modOnly: true });
exports.Administration = new Group_1.default({ name: "Administration", description: "", guildOnly: true, adminOnly: true });
exports.OwnerOnly = new Group_1.default({ name: "Owner Only", description: "", ownerOnly: true });
//# sourceMappingURL=Groups.js.map