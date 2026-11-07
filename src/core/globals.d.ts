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
declare const globalStore: GlobalStore;
export { globalStore };
//# sourceMappingURL=globals.d.ts.map