"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalStore = void 0;
class GlobalStore {
    constructor() {
        this.values = new Map();
    }
    set(name, value) {
        this.values.set(String(name), value);
        return this;
    }
    get(name) {
        return this.values.get(String(name));
    }
    has(name) {
        return this.values.has(String(name));
    }
    delete(name) {
        return this.values.delete(String(name));
    }
    clear() {
        this.values.clear();
    }
    keys() {
        return Array.from(this.values.keys());
    }
    entries() {
        return Array.from(this.values.entries());
    }
    toObject() {
        return Object.fromEntries(this.values.entries());
    }
}
const globalStore = new GlobalStore();
exports.globalStore = globalStore;
//# sourceMappingURL=globals.js.map