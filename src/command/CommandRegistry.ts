import Command from "./Command";
import Group from "./Group";
import Ping from "../commands/Basic/Ping";
import ReplyLast from "../commands/Mod Mail/ReplyLast";
import ReplyTo from "../commands/Mod Mail/ReplyTo";
import Echo from "../commands/OwnerOnly/Echo";
import Help from "../commands/Basic/Help";

class CommandRegistry {
    readonly commands: ReadonlyArray<Command> = [
        new Help(),
        new Ping(),
        new ReplyLast(),
        new ReplyTo(),
        new Echo()
    ];
    readonly groups: ReadonlyArray<Group> = this.commands.map((command) => command.group).filter((group, index, self) => self.indexOf(group) === index);

    getCommands(group: Group): ReadonlyArray<Command> {
        return this.commands.filter((command) => command.group === group);
    }

    getCommand(trigger: string): Command | undefined {
        return this.commands.find((command) => command.triggers.includes(trigger.toLowerCase()));
    }
}

export default new CommandRegistry();