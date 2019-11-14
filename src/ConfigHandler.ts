import * as fs from "fs";

interface IFunctionBase {
    (value: any, key: string): boolean | string[];
    readonly trueName: string,
}

export interface IFunction <T> extends IFunctionBase {
    readonly defaultValue: T;
}

export type IFunctionType <T> = T extends IFunction <infer U> ? U : never;

function createBaseType (trueName: string, check: (value: any, key: string) => boolean | string[]): IFunctionBase {
    function temp(value: any, key: string) {
        return check(value, key)
    }
    temp.trueName = trueName;
    return temp;
}

function createType <T> (trueName: string, defaultValue: T, check: (value: any, key: string) => boolean | string[]): IFunction <T> {
    const temp = createBaseType(trueName, check) as any;
    temp.defaultValue = defaultValue;
    return temp;
}

function checkObject(object: { [key: string]: any }, template: { [key: string]: IFunction <any> }, name = "") {
    const errors = [];

    for (const key in template) {
        const check = template[key];

        const result = check(object[key], name + key);
        if (result instanceof Array) {
            errors.push(...result);
        }
        else if (!result) {
            if (object[key] === undefined) {
                errors.push(`${name}${key} does not not exists and must have the type of ${template[key].trueName}`);
            }
            else {
                errors.push(`${name}${key} must be the type of ${template[key].trueName}`);
            }
        }
    }

    return errors;
}

export const base = {
    boolean: createBaseType("Boolean", (value: any) => typeof value === "boolean"),
    number: createBaseType("Number", (value: any) => typeof value === "number"),
    string: createBaseType("String", (value: any) => typeof value === "string"),
}

export function boolean(defaultValue: boolean) {
    return createType(base.boolean.trueName, defaultValue, base.boolean);
}

export function number(defaultValue: number) {
    return createType(base.number.trueName, defaultValue, base.number);
}

export function string(defaultValue: string) {
    return createType(base.string.trueName, defaultValue, base.string);
}

export function optional <T> (type: IFunctionBase, defaultValue ? : T | null) {
    return createType(type.trueName + "?", defaultValue, (value: any, key: string) => value === undefined || value === null || type(value, key));
}

export function array <T> (type: IFunctionBase, defaultValue: T[] = []) {
    return createType(type.trueName + "[]", defaultValue, (value: any, key: string) => value instanceof Array && value.every((it) => type(it, key) === true));
}

export function object(template: { [key: string]: IFunction <any> }) {
    const defaultValue: {
        [key: string]: any
    } = {};

    for (const key in template) {
        defaultValue[key] = template[key].defaultValue;
    }

    return createType("Object", defaultValue, (value: any, key ? : string) => {
        if (typeof value === "object") {
            const errors = checkObject(value, template, key + ".");
            if (errors.length === 0) {
                return true
            }
            else {
                return errors;
            }
        }
        else {
            return false;
        }
    })
}

export function generateConfig(file: string, template: { [key: string]: IFunction <any> }) {
    const config: {
        [key: string]: any
    } = {};

    for (const key in template) {
        config[key] = template[key].defaultValue;
    }

    fs.writeFileSync(file, JSON.stringify(config));
}

export function getConfig <T extends { [key: string]: IFunction <any> }> (file: string, template: T) {
    const config = JSON.parse(fs.readFileSync(file).toString());
    const errors = checkObject(config, template);

    if (errors.length === 0) {
        return config as { [key in keyof T]: IFunctionType <T[key]> }
    }
    else {
        errors.forEach((error) => console.error(error));
        return undefined;
    }
}