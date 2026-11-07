import { EventEmitter } from 'events';
import { defaultFilters } from '../builtins/filters';
import { EngineOptions, ParseResult, PluginContext } from '../types';
declare class EmbedView extends EventEmitter {
    private cache;
    private filters;
    private plugins;
    private options;
    private layouts;
    private watchers;
    private outputBuffer;
    constructor(options?: EngineOptions);
    use(plugin: PluginContext): void;
    registerFilter(name: string, fn: (value: any, ...args: any[]) => any): void;
    /**
     * Süreç genelindeki global değeri yazar. Değer türü korunur; şablonlar
     * içinden `setglobal(ad, değer)` çağrısı da aynı depoya yazar.
     */
    setglobal(name: string, value: any): this;
    /** Global değeri olduğu gibi (object, array, number ...) döndürür. */
    getglobal(name: string): any;
    hasglobal(name: string): boolean;
    deleteglobal(name: string): boolean;
    clearglobals(): void;
    getglobals(): Record<string, any>;
    applyFilter(value: any, filterName: string, ...args: any[]): any;
    watch(filePath: string): void;
    unwatch(filePath: string): void;
    registerLayout(name: string, content: string): void;
    loadLayout(name: string): string | null;
    includePartial(name: string, data?: Record<string, any>): Promise<string>;
    /**
     * Kök dizin dışına çıkan yolları reddeder. `allowOutsideRoot: true`
     * verilmediği sürece sembolik bağlantı kaçışları da engellenir.
     */
    private isPathAllowed;
    /**
     * Şablon adını güvenli biçimde gerçek bir dosyaya çözer.
     * Sıra: tam yol, `.emv`, `.html`, `.js`.
     */
    resolveTemplate(name: string, baseDir?: string): string | null;
    private withQuery;
    private createContext;
    /**
     * contextObj.__layout varsa layout dosyasını okur, {@render} yerlerine
     * blok içeriklerini koyar ve layout'u yeniden parse eder.
     * Layout yoksa null döner.
     */
    private renderLayout;
    parseString(htmlString: string, basePath?: string, locals?: Record<string, any>): ParseResult;
    parseFile(filePath: string, locals?: Record<string, any>): ParseResult;
    parseStringAsync(htmlString: string, basePath?: string, locals?: Record<string, any>, blocks?: Record<string, string>, importStack?: string[]): Promise<ParseResult>;
    parseFileAsync(filePath: string, locals?: Record<string, any>, blocks?: Record<string, string>, importStack?: string[]): Promise<ParseResult>;
    /**
     * Tek bir şablon dosyasını adaptör veya framework olmadan render eder.
     * Başarıda HTML döner, dosya bulunamazsa/izin yoksa hata fırlatır.
     */
    renderFile(filePath: string, locals?: Record<string, any>): Promise<string>;
    /** Motor örneği kurmadan tek dosya render eder. */
    static renderFile(filePath: string, locals?: Record<string, any>, options?: EngineOptions): Promise<string>;
    /**
     * `node:http` için sıfır-kurulum istek işleyicisi üretir.
     *
     * ```js
     * http.createServer(engine.handler('index.emv')).listen(3000);
     * ```
     *
     * İstek kendi async kapsamında render edilir; `$getvar` / `$postvar`
     * değerleri ek parametre olmadan doğrudan istekten okunur.
     */
    handler(filePath: string): (request: any, response: any) => Promise<void>;
    precompile(filePath: string, outputPath: string): Promise<boolean>;
    clearCache(filePath?: string): void;
    getCacheStats(): {
        size: number;
        entries: string[];
    };
    attachExit(): void;
    destroy(): void;
}
export { EmbedView, defaultFilters };
//# sourceMappingURL=embed-view.d.ts.map