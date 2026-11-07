/**
 * embedview paylaşılan tip sözleşmesi.
 *
 * Tüm modüller (engine, compiler, context, filters, view-engine adaptörü)
 * bu dosyadan tek kaynak olarak tip alır; burada değer üretilmez.
 */
/** Derlenmiş (compile edilmiş) şablon kaydı. */
export interface CompiledTemplate {
    fn: (context: any) => Promise<string>;
    mtime: number;
}
/** Motor kurulum seçeneklerinin tamamı isteğe bağlıdır. */
export interface EngineOptions {
    cache?: boolean;
    debug?: boolean;
    timeout?: number;
    delimiter?: string;
    allowedModules?: string[];
    layoutsDir?: string;
    partialsDir?: string;
    precompile?: boolean;
    errorHandler?: (err: Error, type: string) => string;
    /** Dosya erişiminin sınırlandırılacağı kök dizin (varsayılan: process.cwd()). */
    rootPath?: string;
    /** Kök dizin dışındaki dosyalara erişime izin verir (varsayılan: false). */
    allowOutsideRoot?: boolean;
    /** Render edilebilecek uzantılar (varsayılan: ['.emv', '.html', '.js']). */
    allowedExtensions?: string[];
}
/** Paket içindeki global değer deposunun sözleşmesi (dışarıya açılmaz). */
export interface GlobalScope {
    set(name: string, value: any): any;
    get(name: string): any;
    has(name: string): boolean;
    delete(name: string): boolean;
    clear(): void;
    keys(): string[];
    entries(): Array<[string, any]>;
    toObject(): Record<string, any>;
}
/** Şablonlara uygulanabilir filtre haritası. */
export type FilterMap = Record<string, (value: any, ...args: any[]) => any>;
/** Parse/render sonucu. Hatalarda success=false ve error alanı doludur. */
export interface ParseResult {
    html: string;
    success: boolean;
    error?: string;
    /** İleride hata konumu raporlaması için ayrılmış alan. */
    line?: number;
    /** İleride kaynak gösterimi için ayrılmış alan. */
    source?: string;
}
/** Şablon bağlamına enjekte edilen dosya sistemi yardımcıları. */
export interface PathUtils {
    __dir: string;
    __file: string;
    cwd: () => string;
    join: (...segments: string[]) => string;
    resolve: (...segments: string[]) => string;
    basename: (p: string, ext?: string) => string;
    dirname: (p: string) => string;
    extname: (p: string) => string;
    relative: (from: string, to: string) => string;
    exists: (p: string) => boolean;
    ls: (p?: string) => string[];
}
/** Kullanıcı eklentisi: filtre/helpers ve yaşam döngüsü kancaları. */
export interface PluginContext {
    name?: string;
    helpers?: FilterMap;
    onParse?: (html: string) => string;
    onRender?: (html: string) => string;
    onError?: (error: Error) => void;
}
/**
 * Adaptörün monte edilebileceği herhangi bir nesne.
 *
 * Express, Koa, Fastify, bir http sunucusu ya da kendi yazdığınız bir
 * kapsayıcı olabilir. Yalnızca `engine` + `set` + `get` sunan nesnelere
 * otomatik monte edilir; diğerlerinde adaptör `render`/`renderView` ile
 * doğrudan kullanılır.
 */
export interface ViewEngineHost {
    engine?: (extension: string, fn: ViewRenderFn) => any;
    set?: (setting: string, value: any) => any;
    get?: (setting: string) => any;
    [key: string]: any;
}
/** View engine'in çağırdığı render fonksiyonu. */
export type ViewRenderFn = (filePath: string, options: ViewRenderOptions, callback: (err: Error | null, html?: string) => void) => void;
/** Render sırasında geçen seçenekler (settings, _locals ve user locals). */
export interface ViewRenderOptions {
    settings?: Record<string, any>;
    [key: string]: any;
}
/** ViewEngine kurulum seçenekleri. */
export interface ViewEngineOptions {
    views?: string | string[];
    extension?: string;
    aliases?: string[];
    override?: boolean;
    cache?: boolean;
    debug?: boolean;
    watch?: boolean;
    timeout?: number;
    delimiter?: string;
    allowedModules?: string[];
    layoutsDir?: string;
    partialsDir?: string;
    precompile?: boolean;
    errorHandler?: (err: Error, type: string) => string;
    rootPath?: string;
    allowOutsideRoot?: boolean;
    allowedExtensions?: string[];
    errorPage?: 'overlay' | 'error';
}
//# sourceMappingURL=index.d.ts.map