export class DuplicationError extends Error {
    constructor(duplicates: Map<string, any>) {
        const duplicateString = [...duplicates.entries()]
            .map((entry) => `${entry[0]}: ${entry[1]}`)
            .join(", ");

        super(`Duplicate values found: { ${duplicateString} }`);
    }
}