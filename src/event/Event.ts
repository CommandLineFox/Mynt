import MyntClient from "~/MyntClient";

interface EventOptions {
    readonly name: string;
    readonly disabled?: boolean;
}

export default abstract class Event implements EventOptions {
    public readonly name: string;
    public readonly disabled: boolean;

    public constructor(options: EventOptions) {
        this.name = options.name;
        this.disabled = options.disabled ?? false;
    }

    public abstract func(client:MyntClient, ...args: any[]): void;
}
