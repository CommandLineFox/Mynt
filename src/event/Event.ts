interface EventOptions {
    readonly name: string;
}

export default abstract class Event implements EventOptions {
    readonly name: string;

    constructor(options: EventOptions) {
        this.name = options.name;
    }
}