import deepEqual from "deep-equal";
import { DuplicationError } from "./Errors";
export function checkForDuplicates(values, value, properties) {
    values.forEach((element) => {
        const duplicates = new Map();
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
                elementTree = elementTree[branch];
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
function returnDuplicatedArray(array1, array2) {
    const arrayDuplicates = [];
    for (const elementTreeElement of array1) {
        if (array2.some((valueTreeElement) => deepEqual(elementTreeElement, valueTreeElement))) {
            arrayDuplicates.push(elementTreeElement);
        }
    }
    return arrayDuplicates;
}
export async function splitMessage(message, converter) {
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
export function getArgument(message, length) {
    const argument = message.substring(length).trim();
    if (argument === "") {
        return undefined;
    }
    return argument;
}
export function nameCheck(message, list, checker) {
    const iterator = message[Symbol.iterator]();
    let currentIteration = iterator.next();
    let name = "";
    while (!currentIteration.done) {
        const char = currentIteration.value;
        currentIteration = iterator.next();
        if (char === " ") {
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
export function tagCheck(message, list, checker) {
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
export function merge(defaultValue, value) {
    return { ...defaultValue, ...value };
}
//# sourceMappingURL=Utils.js.map