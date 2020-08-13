import * as fs from "fs";
function createBaseType(theName, check) {
    function temp(value, key) {
        return check(value, key);
    }
    temp.theName = theName;
    return temp;
}
function createType(trueName, defaultValue, check) {
    function temp(value, key) {
        return check(value, key);
    }
    temp.trueName = trueName;
    temp.defaultValue = defaultValue;
    return temp;
}
function checkObject(object, template, name = "") {
    const errors = [];
    for (const key in template) {
        const check = template[key];
        const result = check(object[key], name + key);
        if (result instanceof Array) {
            errors.push(...result);
        }
        else if (!result) {
            if (object[key] === undefined) {
                errors.push(`${name}${key} does not exist and must have the type of ${template[key].trueName}`);
            }
            else {
                errors.push(`${name}${key} must be the type of ${template[key].trueName}`);
            }
        }
    }
    return errors;
}
export const base = {
    boolean: createBaseType("Boolean", (value) => typeof value === "boolean"),
    number: createBaseType("Number", (value) => typeof value === "number"),
    string: createBaseType("String", (value) => typeof value === "string"),
};
export function boolean(defaultValue) {
    return createType(base.boolean.theName, defaultValue, base.boolean);
}
export function number(defaultValue) {
    return createType(base.number.theName, defaultValue, base.number);
}
export function string(defaultValue) {
    return createType(base.string.theName, defaultValue, base.string);
}
export function object(template) {
    const defaultValue = {};
    for (const key in template) {
        defaultValue[key] = template[key].defaultValue;
    }
    return createType("Object", defaultValue, (value, key) => {
        if (typeof value === "object") {
            const errors = checkObject(value, template, key + ".");
            if (errors.length === 0) {
                return true;
            }
            else {
                return errors;
            }
        }
        else {
            return false;
        }
    });
}
export function optional(type, defaultValue) {
    return createType(type.theName + "?", defaultValue, (value, key) => value === undefined || value === null || type(value, key));
}
export function optionalObject(template, defaultValue = true) {
    const templateObject = object(template);
    return createType(templateObject.trueName + "?", defaultValue ? templateObject.defaultValue : null, (value, key) => value === undefined || value === null || templateObject(value, key));
}
export function arrayWithOptional(type, defaultValue) {
    return createType(type.theName + "[]", defaultValue, (value, key) => value instanceof Array && value.every((it) => it === undefined || it === null || type(it, key) === true));
}
export function arrayWithOptionalObject(template, defaultValue = true) {
    const templateObject = object(template);
    return createType(templateObject.trueName, defaultValue ? [templateObject.defaultValue] : [], (value, key) => value instanceof Array && value.every((it) => it === undefined || it === null || templateObject(it, key) === true));
}
export function array(type, defaultValue = []) {
    return createType(type.theName + "[]", defaultValue, (value, key) => value instanceof Array && value.every((it) => type(it, key) === true));
}
export function optionalArray(type, defaultValue = []) {
    return createType(type.theName + "[]", defaultValue, (value, key) => value === undefined || value === null || value instanceof Array && value.every((it) => type(it, key) === true));
}
export function objectArray(template, defaultValue = true) {
    const templateObject = object(template);
    return createType(templateObject.trueName, defaultValue ? [templateObject.defaultValue] : [], (value, key) => value instanceof Array && value.every((it) => templateObject(it, key) === true));
}
export function optionalObjectArray(template, defaultValue = true) {
    const templateObject = object(template);
    return createType(templateObject.trueName, defaultValue ? [templateObject.defaultValue] : [], (value, key) => value === undefined || value === null || value instanceof Array && value.every((it) => templateObject(it, key) === true));
}
export function generateConfig(file, template) {
    const config = {};
    for (const key in template) {
        config[key] = template[key].defaultValue;
    }
    fs.writeFileSync(file, JSON.stringify(config));
}
export function getConfig(file, template) {
    const config = JSON.parse(fs.readFileSync(file).toString());
    const errors = checkObject(config, template);
    if (errors.length === 0) {
        return config;
    }
    else {
        errors.forEach((error) => console.error(error));
        return undefined;
    }
}
//# sourceMappingURL=ConfigHandler.js.map