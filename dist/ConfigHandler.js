"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = exports.generateConfig = exports.optionalObjectArray = exports.objectArray = exports.optionalArray = exports.array = exports.arrayWithOptionalObject = exports.arrayWithOptional = exports.optionalObject = exports.optional = exports.object = exports.string = exports.number = exports.boolean = exports.base = void 0;
const fs = __importStar(require("fs"));
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
exports.base = {
    boolean: createBaseType("Boolean", (value) => typeof value === "boolean"),
    number: createBaseType("Number", (value) => typeof value === "number"),
    string: createBaseType("String", (value) => typeof value === "string"),
};
function boolean(defaultValue) {
    return createType(exports.base.boolean.theName, defaultValue, exports.base.boolean);
}
exports.boolean = boolean;
function number(defaultValue) {
    return createType(exports.base.number.theName, defaultValue, exports.base.number);
}
exports.number = number;
function string(defaultValue) {
    return createType(exports.base.string.theName, defaultValue, exports.base.string);
}
exports.string = string;
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
function optional(type, defaultValue) {
    return createType(type.theName + "?", defaultValue, (value, key) => value === undefined || value === null || type(value, key));
}
exports.optional = optional;
function optionalObject(template, defaultValue = true) {
    const templateObject = object(template);
    return createType(templateObject.trueName + "?", defaultValue ? templateObject.defaultValue : null, (value, key) => value === undefined || value === null || templateObject(value, key));
}
exports.optionalObject = optionalObject;
function arrayWithOptional(type, defaultValue) {
    return createType(type.theName + "[]", defaultValue, (value, key) => value instanceof Array && value.every((it) => it === undefined || it === null || type(it, key) === true));
}
exports.arrayWithOptional = arrayWithOptional;
function arrayWithOptionalObject(template, defaultValue = true) {
    const templateObject = object(template);
    return createType(templateObject.trueName, defaultValue ? [templateObject.defaultValue] : [], (value, key) => value instanceof Array && value.every((it) => it === undefined || it === null || templateObject(it, key) === true));
}
exports.arrayWithOptionalObject = arrayWithOptionalObject;
function array(type, defaultValue = []) {
    return createType(type.theName + "[]", defaultValue, (value, key) => value instanceof Array && value.every((it) => type(it, key) === true));
}
exports.array = array;
function optionalArray(type, defaultValue = []) {
    return createType(type.theName + "[]", defaultValue, (value, key) => value === undefined || value === null || value instanceof Array && value.every((it) => type(it, key) === true));
}
exports.optionalArray = optionalArray;
function objectArray(template, defaultValue = true) {
    const templateObject = object(template);
    return createType(templateObject.trueName, defaultValue ? [templateObject.defaultValue] : [], (value, key) => value instanceof Array && value.every((it) => templateObject(it, key) === true));
}
exports.objectArray = objectArray;
function optionalObjectArray(template, defaultValue = true) {
    const templateObject = object(template);
    return createType(templateObject.trueName, defaultValue ? [templateObject.defaultValue] : [], (value, key) => value === undefined || value === null || value instanceof Array && value.every((it) => templateObject(it, key) === true));
}
exports.optionalObjectArray = optionalObjectArray;
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