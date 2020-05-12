import deepEqual from "deep-equal";
import { Collection } from "discord.js";
import { DuplicationError } from "./Errors";

export function checkForDuplicates<T extends object>(values: T[], value: T, properties: string[]) {
    values.forEach((element) => {
        const duplicates: Map<string, any> = new Map();
        properties.forEach((property) => {
            let elementTree = element;
            let valueTree = value;
            const branches = property.split(".");

            for (const branch of branches) {
                if (elementTree instanceof Array && valueTree instanceof Array) {
                    if (branch === "deep") {
                        if (deepEqual(valueTree, elementTree)) {
                            duplicates.set(property, valueTree);
                        }
                        return;
                    }
                }

                if (typeof elementTree !== "object" || typeof valueTree !== "object") {
                    return;
                }

                // @ts-ignore
                elementTree = elementTree[branch];

                // @ts-ignore
                valueTree = valueTree[branch];
            }

            if (elementTree instanceof Array && valueTree instanceof Array) {
                const arrayDuplicates = returnDuplicatedArray(elementTree, valueTree);

                if (arrayDuplicates.length > 0) {
                    duplicates.set(property, arrayDuplicates);
                }

            }
            else if (deepEqual(valueTree, elementTree)) {
                duplicates.set(property, valueTree);
            }
        });

        if (duplicates.size > 0) {
            throw new DuplicationError(duplicates);
        }
    });
}

function returnDuplicatedArray(array1: any[], array2: any[]): any[] {
    const arrayDuplicates = [];

    for (const elementTreeElement of array1) {
        if (array2.some((valueTreeElement) => deepEqual(elementTreeElement, valueTreeElement))) {
            arrayDuplicates.push(elementTreeElement);
        }
    }
    return arrayDuplicates;
}

export async function splitMessage<T>(
    message: string,
    converter: (part: string) => T | Promise<T>,
): Promise<[T?, string?]> {
    let valueString = "";

    for (const char of message) {
        if (char.trim() === "") {
            break;
        }
        valueString += char;
    }

    const value = await Promise.resolve(converter(valueString));

    if (value === undefined) {
        return [undefined, message];
    }
    return [value, getArgument(message, valueString.length)];
}

export function getArgument(message: string, length: number) {
    const argument = message.substring(length).trim();
    if (argument === "") {
        return undefined;
    }
    return argument;
}

export function nameCheck<T>(
    message: string,
    list: T[] | Collection<any, T>,
    checker: (value: T, name: string) => boolean,

): [T?, string?] {
    const iterator = message[Symbol.iterator]();
    let currentIteration = iterator.next();
    let name = "";

    while (!currentIteration.done) {
        const char = currentIteration.value;
        currentIteration = iterator.next();

        if (char === " ") {
            // @ts-ignore
            const result = list.find((value) => checker(value, name));
            if (result !== undefined) {
                return [result, getArgument(message, name.length)];
            }
        }

        name += char;

        if (name.length > 32) {
            return [undefined, message];
        }
    }
    return [undefined, message];
}

export function tagCheck<T>(
    message: string,
    list: T[] | Collection<any, T>,
    checker: (value: T, tag: string) => boolean,
): [T?, string?] {
    const iterator = message[Symbol.iterator]();
    let currentIteration = iterator.next();
    let tag = "";

    while (!currentIteration.done) {
        const char = currentIteration.value;
        currentIteration = iterator.next();
        tag += char;

        if (char === "#") {
            for (let i = 0; i < 4; i++) {
                if (currentIteration.done) {
                    return [undefined, message];
                }

                tag += currentIteration.value;
                currentIteration = iterator.next();
            }

            // @ts-ignore

            const result = list.find((value) => checker(value, name));
            if (result === undefined) {
                return [undefined, message];
            }
            return [result, getArgument(message, tag.length)];
        }

        if (tag.length > 32) {
            return [undefined, message];
        }
    }
    return [undefined, message];
}

export function merge<T extends object>(defaultValue: Partial<T>, value: T): T {
    return { ...defaultValue, ...value };
}