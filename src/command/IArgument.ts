import CommandEvent from "./CommandEvent";

export default interface IArgument<T> {
    toType(event: CommandEvent, message: string, isLast: boolean): Promise<[T?, string?]>;
}