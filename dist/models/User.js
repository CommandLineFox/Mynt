import { ObjectId } from 'bson';
export class User {
    constructor(data) {
        var _a;
        this._id = new ObjectId();
        this.id = data.id;
        this.infractions = (_a = data.infractions) !== null && _a !== void 0 ? _a : [];
    }
}
//# sourceMappingURL=User.js.map