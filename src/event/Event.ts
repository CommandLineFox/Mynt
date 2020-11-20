import MyntClient from "~/MyntClient";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventFunction = (client: MyntClient, ...args: any[]) => void;

export default class Event {
    public constructor(public name: string, public func: EventFunction) {
    }
}
