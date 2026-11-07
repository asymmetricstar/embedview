import { EmbedView } from '../core/embed-view';
import { ViewEngineHost, ViewEngineOptions, ViewRenderFn, ViewRenderOptions } from '../types';
/**
 * Framework bağımsız view engine adaptörü.
 *
 * `engine` + `set` + `get` sunan herhangi bir kapsayıcıya (Express, Koa
 * sarmalayıcıları, kendi yazdığınız yapı) monte edilebilir. Bu arayüzü
 * sunmayan nesnelerde monte etmez; `render` / `renderView` doğrudan kullanılır.
 */
declare class ViewEngine {
    readonly app: ViewEngineHost | null;
    readonly engine: EmbedView;
    readonly views: string[];
    readonly extension: string;
    readonly aliases: string[];
    readonly errorPage: 'overlay' | 'error';
    readonly debug: boolean;
    /** Framework'e verilebilecek hazır render fonksiyonu. */
    readonly render: ViewRenderFn;
    private readonly rootPath;
    private readonly allowOutsideRoot;
    private readonly allowedExtensions;
    private readonly dirWatchers;
    private mounted;
    constructor(app?: ViewEngineHost | null, options?: ViewEngineOptions);
    /** Kapsayıcı otomatik montaj için gereken arayüzü sunuyor mu? */
    canMount(): boolean;
    /**
     * Motoru kapsayıcıya kaydeder ve view ayarlarını yazar. Idempotent'tir.
     * Uyumsuz bir nesnede sessizce atlanır; render() çalışmaya devam eder.
     */
    mount(override?: boolean): this;
    /**
     * View adını mevcut bir dosyaya çözer: tam ad, sonra `.emv` → `.html` → `.js`.
     * Çözülemezse adı olduğu gibi bırakır; hata kapsayıcıya bırakılır.
     */
    resolveView(name: string): string;
    /** `renderView` kısayolu: `renderFile()` ile aynı davranış. */
    renderFile(filePath: string, options?: ViewRenderOptions): Promise<string>;
    /** Tek bir view dosyasını render eder (framework callback'i olmadan). */
    renderView(filePath: string, options?: ViewRenderOptions): Promise<string>;
    /** Cache'i tek dosya veya tamamen temizler. */
    invalidate(filePath?: string): void;
    /** Watcher'ları kapatır, cache'i boşaltır ve kapsayıcıdaki kaydı düşürür. */
    destroy(): void;
    /**
     * Express benzeri uygulamalarda her isteği kendi async kapsamına alır.
     * Böylece render sırasında GET/POST değerleri otomatik okunur.
     */
    private installRequestScope;
    /**
     * Express benzeri kapsayıcılarda `render('index')` çağrısının
     * index.emv → index.html → index.js sırasıyla çözülmesini sağlar.
     */
    private patchRenderResolution;
    private restoreRenderResolution;
    private isInsideAllowedRoot;
    /** Kapsayıcının iç anahtarlarını ayıklar; settings['view options'] değerlerini birleştirir. */
    private extractLocals;
    private decorateError;
    private getSetting;
    private resolveViews;
    private resolveEnv;
    private resolveExtension;
    private resolveAliases;
    private normalizeExtension;
    private scanViewExtensions;
    private watchViews;
    /** Aynı uygulamaya ikinci kez kurulum yapılmasını engeller. */
    static mount(app: ViewEngineHost, options?: ViewEngineOptions): ViewEngine;
}
export { ViewEngine };
//# sourceMappingURL=view-engine.d.ts.map