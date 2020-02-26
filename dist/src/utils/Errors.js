"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DuplicationError extends Error {
    constructor(duplicates) {
        const duplicateString = [...duplicates.entries()]
            .map((entry) => `${entry[0]}: ${entry[1]}`)
            .join(", ");
        super(`Duplicate values found: { ${duplicateString} }`);
    }
}
exports.DuplicationError = DuplicationError;
//# sourceMappingURL=Errors.js.map