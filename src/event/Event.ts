import MyntClient from "~/MyntClient";

type EventFunction = (client: MyntClient, ...args: any[]) => void;

export default class Event {
    constructor(public name: string, public func: EventFunction) { }
}