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
declare class GlobalStore {
    private values;
    set(name: string, value: any): this;
    get(name: string): any;
    has(name: string): boolean;
    delete(name: string): boolean;
    clear(): void;
    keys(): string[];
    entries(): Array<[string, any]>;
    toObject(): Record<string, any>;
}
/** Paket genelinde paylaşılan tek global kapsam. */
declare const globalStore: GlobalStore;
export { globalStore };
//# sourceMappingURL=globals.d.ts.map