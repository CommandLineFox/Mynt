"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
function createBaseType(trueName, check) {
    function temp(value, key) {
        return check(value, key);
    }
    temp.trueName = trueName;
    return temp;
}
function createType(trueName, defaultValue, check) {
    const temp = createBaseType(trueName, check);
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
                errors.push(`${name}${key} does not not exists and must have the type of ${template[key].trueName}`);
            }
            else {
                errors.push(`${name}${key} must be the type of ${template[key].trueName}`);
            }
        }
    }
    return errors;
}
exports.base = {
    boolean: createBaseType("Boolean", (value) => typeof value === "boolean"),
    number: createBaseType("Number", (value) => typeof value === "number"),
    string: createBaseType("String", (value) => typeof value === "string"),
};
function boolean(defaultValue) {
    return createType(exports.base.boolean.trueName, defaultValue, exports.base.boolean);
}
exports.boolean = boolean;
function number(defaultValue) {
    return createType(exports.base.number.trueName, defaultValue, exports.base.number);
}
exports.number = number;
function string(defaultValue) {
    return createType(exports.base.string.trueName, defaultValue, exports.base.string);
}
exports.string = string;
function optional(type, defaultValue) {
    return createType(type.trueName + "?", defaultValue, (value, key) => value === undefined || value === null || type(value, key));
}
exports.optional = optional;
function array(type, defaultValue = []) {
    return createType(type.trueName + "[]", defaultValue, (value, key) => value instanceof Array && value.every((it) => type(it, key) === true));
}
exports.array = array;
function object(template) {
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
exports.object = object;
function generateConfig(file, template) {
    const config = {};
    for (const key in template) {
        config[key] = template[key].defaultValue;
    }
    fs.writeFileSync(file, JSON.stringify(config));
}
exports.generateConfig = generateConfig;
function getConfig(file, template) {
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
exports.getConfig = getConfig;
//# sourceMappingURL=ConfigHandler.js.map