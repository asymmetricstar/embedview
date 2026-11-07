"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalStore = void 0;
/**
 * Şablonlar arasında paylaşılan süreç-içi global değer deposu.
 *
 * Tasarım gereği kullanıcı store oluşturmaz ve motor seçeneklerine bir şey
 * geçirmez: paket içinde tek bir örnek (`globalStore`) tutulur. Şablonlar
 * `setglobal(ad, değer)` ile yazar, `getglobal("ad")` ile okur; değerler
 * tür korunarak (object, array, number, string, boolean ...) saklanır.
 *
 * Depo süreç ömrü boyunca yaşar; bu yüzden a.html içinde yazılan bir değer
 * sonraki render çağrısında b.html tarafından okunabilir.
 */
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
/** Paket genelinde paylaşılan tek global kapsam. */
const globalStore = new GlobalStore();
exports.globalStore = globalStore;
//# sourceMappingURL=globals.js.map