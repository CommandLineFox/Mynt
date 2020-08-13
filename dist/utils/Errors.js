export class DuplicationError extends Error {
    constructor(duplicates) {
        const duplicateString = [...duplicates.entries()]
            .map((entry) => `${entry[0]}: ${entry[1]}`)
            .join(", ");
        super(`Duplicate values found: { ${duplicateString} }`);
    }
}
//# sourceMappingURL=Errors.js.map