import Help from "../commands/Basic/Help";
import Ping from "../commands/Basic/Ping";
import ReplyLast from "../commands/Mod Mail/ReplyLast";
import ReplyTo from "../commands/Mod Mail/ReplyTo";
import Avatar from "../commands/Moderation/Avatar";
import Echo from "../commands/OwnerOnly/Echo";
import Eval from "../commands/OwnerOnly/Eval";
import LogOff from "../commands/OwnerOnly/LogOff";
class CommandRegistry {
    constructor() {
        this.commands = [
            new Help(),
            new Ping(),
            new ReplyLast(),
            new ReplyTo(),
            new Avatar(),
            new Echo(),
            new Eval(),
            new LogOff()
        ];
        this.groups = this.commands.map((command) => command.group).filter((group, index, self) => self.indexOf(group) === index);
    }
    getCommands(group) {
        return this.commands.filter((command) => command.group === group);
    }
    getCommand(trigger) {
        return this.commands.find((command) => command.triggers.includes(trigger.toLowerCase()));
    }
}
export default new CommandRegistry();
//# sourceMappingURL=CommandRegistry.js.map