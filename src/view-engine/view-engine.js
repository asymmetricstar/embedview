"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewEngine = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const embed_view_1 = require("../core/embed-view");
const constants_1 = require("../utils/constants");
const request_1 = require("../core/request");
const file_utils_1 = require("../utils/file-utils");
/**
 * Framework bağımsız view engine adaptörü.
 *
 * `engine` + `set` + `get` sunan herhangi bir kapsayıcıya (Express, Koa
 * sarmalayıcıları, kendi yazdığınız yapı) monte edilebilir. Bu arayüzü
 * sunmayan nesnelerde monte etmez; `render` / `renderView` doğrudan kullanılır.
 */
class ViewEngine {
    constructor(app = null, options = {}) {
        this.dirWatchers = [];
        this.mounted = false;
        this.app = app ?? null;
        this.views = this.resolveViews(options.views);
        const env = this.resolveEnv();
        this.debug = options.debug ?? env !== 'production';
        const cache = options.cache ?? env === 'production';
        this.extension = this.resolveExtension(options.extension);
        this.aliases = this.resolveAliases(options.aliases);
        this.errorPage = options.errorPage ?? 'overlay';
        this.rootPath = path.resolve(options.rootPath ?? this.views[0]);
        this.allowOutsideRoot = options.allowOutsideRoot ?? false;
        this.allowedExtensions = options.allowedExtensions ?? constants_1.DEFAULT_TEMPLATE_EXTENSIONS;
        this.engine = new embed_view_1.EmbedView({
            cache,
            debug: this.debug,
            timeout: options.timeout,
            delimiter: options.delimiter,
            allowedModules: options.allowedModules,
            layoutsDir: options.layoutsDir ?? this.views[0],
            partialsDir: options.partialsDir ?? this.views[0],
            precompile: options.precompile,
            errorHandler: options.errorHandler,
            rootPath: this.rootPath,
            allowOutsideRoot: this.allowOutsideRoot,
            allowedExtensions: this.allowedExtensions
        });
        this.render = (filePath, renderOptions, callback) => {
            this.renderView(filePath, renderOptions)
                .then(html => callback(null, html))
                .catch(err => callback(err instanceof Error ? err : new Error(String(err))));
        };
        if (options.watch ?? !cache) {
            this.watchViews();
        }
        this.mount(options.override ?? false);
    }
    /** Kapsayıcı otomatik montaj için gereken arayüzü sunuyor mu? */
    canMount() {
        const app = this.app;
        return !!app && typeof app.engine === 'function' && typeof app.set === 'function' && typeof app.get === 'function';
    }
    /**
     * Motoru kapsayıcıya kaydeder ve view ayarlarını yazar. Idempotent'tir.
     * Uyumsuz bir nesnede sessizce atlanır; render() çalışmaya devam eder.
     */
    mount(override = false) {
        if (this.mounted || !this.canMount()) {
            if (!this.mounted && this.debug) {
                console.warn('[EmbedView] Uygulama engine/set/get sunmuyor; adaptör monte edilmedi. render() ve renderView() doğrudan kullanılabilir.');
            }
            return this;
        }
        const app = this.app;
        const registered = (app.engines ?? {});
        const register = (ext) => {
            const key = `.${ext}`;
            if (!override && (registered[key] || registered[ext])) {
                if (this.debug) {
                    console.warn(`[EmbedView] ".${ext}" için zaten bir view engine kayıtlı; atlandı (zorlamak için override: true).`);
                }
                return;
            }
            app.engine(ext, this.render);
            registered[key] = this.render;
        };
        register(this.extension);
        for (const alias of this.aliases)
            register(alias);
        app.set('views', this.views);
        app.set('view engine', this.extension);
        this.mounted = true;
        app[constants_1.VIEW_ENGINE_MOUNT] = this;
        this.installRequestScope();
        this.patchRenderResolution();
        if (this.debug) {
            console.log(`[EmbedView] View engine kuruldu → uzantı: .${this.extension}, views: ${this.views.join(', ')}`);
        }
        return this;
    }
    /**
     * View adını mevcut bir dosyaya çözer: tam ad, sonra `.emv` → `.html` → `.js`.
     * Çözülemezse adı olduğu gibi bırakır; hata kapsayıcıya bırakılır.
     */
    resolveView(name) {
        const raw = String(name ?? '');
        const clean = (0, file_utils_1.splitPathAndQuery)(raw).path;
        if (!clean)
            return raw;
        const roots = path.isAbsolute(clean) ? [path.dirname(clean)] : this.views;
        const resolved = (0, file_utils_1.resolveExistingFile)(clean, roots, this.allowedExtensions);
        if (!resolved || !this.isInsideAllowedRoot(resolved))
            return clean;
        return resolved;
    }
    /** `renderView` kısayolu: `renderFile()` ile aynı davranış. */
    renderFile(filePath, options = {}) {
        return this.renderView(filePath, options);
    }
    /** Tek bir view dosyasını render eder (framework callback'i olmadan). */
    async renderView(filePath, options = {}) {
        const { path: cleanPath, query } = (0, file_utils_1.splitPathAndQuery)(filePath);
        const resolved = this.resolveView(cleanPath) || cleanPath;
        const locals = this.extractLocals(options);
        if (Object.keys(query).length > 0) {
            const current = locals.query && typeof locals.query === 'object' && !Array.isArray(locals.query)
                ? locals.query
                : {};
            locals.query = { ...query, ...current };
        }
        let result;
        try {
            result = await this.engine.parseFileAsync(resolved, locals);
        }
        catch (error) {
            throw this.decorateError(error, resolved);
        }
        if (result.success)
            return result.html;
        if (this.errorPage === 'overlay')
            return result.html;
        throw this.decorateError(new Error(result.error || 'Bilinmeyen şablon hatası'), resolved, result);
    }
    /** Cache'i tek dosya veya tamamen temizler. */
    invalidate(filePath) {
        this.engine.clearCache(filePath ? path.resolve(filePath) : undefined);
    }
    /** Watcher'ları kapatır, cache'i boşaltır ve kapsayıcıdaki kaydı düşürür. */
    destroy() {
        for (const watcher of this.dirWatchers) {
            try {
                watcher.close();
            }
            catch { /* yoksay */ }
        }
        this.dirWatchers.length = 0;
        this.engine.clearCache();
        this.restoreRenderResolution();
        const app = this.app;
        if (app && app[constants_1.VIEW_ENGINE_MOUNT] === this) {
            delete app[constants_1.VIEW_ENGINE_MOUNT];
        }
        this.mounted = false;
    }
    /**
     * Express benzeri uygulamalarda her isteği kendi async kapsamına alır.
     * Böylece render sırasında GET/POST değerleri otomatik okunur.
     */
    installRequestScope() {
        const app = this.app;
        if (!app || typeof app.use !== 'function' || typeof app.render !== 'function')
            return;
        if (app[constants_1.VIEW_ENGINE_REQUEST_SCOPE])
            return;
        app.use((request, _response, next) => (0, request_1.runWithRequest)(request, next));
        app[constants_1.VIEW_ENGINE_REQUEST_SCOPE] = true;
    }
    /**
     * Express benzeri kapsayıcılarda `render('index')` çağrısının
     * index.emv → index.html → index.js sırasıyla çözülmesini sağlar.
     */
    patchRenderResolution() {
        const app = this.app;
        if (!app || typeof app.render !== 'function' || app[constants_1.VIEW_ENGINE_RENDER_PATCH])
            return;
        const original = app.render;
        const adapter = this;
        const patched = function (name, options, callback) {
            let opts = options;
            let done = callback;
            if (typeof opts === 'function') {
                done = opts;
                opts = undefined;
            }
            return original.call(this, adapter.resolveView(name), opts, done);
        };
        app[constants_1.VIEW_ENGINE_RENDER_PATCH] = original;
        app.render = patched;
    }
    restoreRenderResolution() {
        const app = this.app;
        const original = app?.[constants_1.VIEW_ENGINE_RENDER_PATCH];
        if (original) {
            app.render = original;
            delete app[constants_1.VIEW_ENGINE_RENDER_PATCH];
        }
    }
    isInsideAllowedRoot(target) {
        if (this.allowOutsideRoot)
            return true;
        if ((0, file_utils_1.isInsideRoot)(target, this.rootPath))
            return true;
        return this.views.some(view => (0, file_utils_1.isInsideRoot)(target, view));
    }
    /** Kapsayıcının iç anahtarlarını ayıklar; settings['view options'] değerlerini birleştirir. */
    extractLocals(options) {
        const locals = {};
        const viewOptions = options?.settings?.['view options'];
        if (viewOptions && typeof viewOptions === 'object') {
            Object.assign(locals, viewOptions);
        }
        for (const [key, value] of Object.entries(options ?? {})) {
            if (key === '_locals')
                continue;
            locals[key] = value;
        }
        return locals;
    }
    decorateError(error, filePath, result) {
        const err = (error instanceof Error ? error : new Error(String(error)));
        err.view = filePath;
        err.status = 500;
        err.expose = this.debug;
        if (result?.line !== undefined)
            err.line = result.line;
        if (result?.source !== undefined)
            err.source = result.source;
        if (!err.message)
            err.message = 'Bilinmeyen şablon hatası';
        return err;
    }
    getSetting(name) {
        const app = this.app;
        if (!app || typeof app.get !== 'function')
            return undefined;
        try {
            return app.get(name);
        }
        catch {
            return undefined;
        }
    }
    resolveViews(input) {
        const raw = input ?? this.getSetting('views');
        const list = Array.isArray(raw)
            ? raw
            : (typeof raw === 'string' && raw.length > 0 ? [raw] : []);
        const dirs = (list.length > 0 ? list : [path.join(process.cwd(), 'views')])
            .map(dir => path.resolve(dir));
        return Array.from(new Set(dirs));
    }
    resolveEnv() {
        const env = this.getSetting('env');
        if (typeof env === 'string' && env.length > 0)
            return env;
        return process.env.NODE_ENV || 'development';
    }
    resolveExtension(input) {
        const normalized = this.normalizeExtension(input);
        if (normalized && normalized !== 'auto')
            return normalized;
        const found = this.scanViewExtensions();
        for (const ext of constants_1.BUILTIN_VIEW_EXTENSIONS) {
            if (found.has(ext))
                return ext;
        }
        return constants_1.DEFAULT_VIEW_EXTENSION;
    }
    resolveAliases(input) {
        const aliases = new Set(constants_1.BUILTIN_VIEW_EXTENSIONS);
        for (const alias of input ?? []) {
            const normalized = this.normalizeExtension(alias);
            if (normalized && normalized !== 'auto')
                aliases.add(normalized);
        }
        aliases.delete(this.extension);
        return Array.from(aliases);
    }
    normalizeExtension(value) {
        if (!value)
            return undefined;
        const normalized = value.replace(/^\.+/, '').trim().toLowerCase();
        return normalized.length > 0 ? normalized : undefined;
    }
    scanViewExtensions() {
        const extensions = new Set();
        const visited = new Set();
        const walk = (dir, depth) => {
            const resolved = path.resolve(dir);
            if (depth > 6 || visited.has(resolved))
                return;
            visited.add(resolved);
            let entries;
            try {
                entries = fs.readdirSync(resolved, { withFileTypes: true });
            }
            catch {
                return;
            }
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    if (entry.name === 'node_modules' || entry.name.startsWith('.'))
                        continue;
                    walk(path.join(resolved, entry.name), depth + 1);
                }
                else if (entry.isFile()) {
                    const ext = this.normalizeExtension(path.extname(entry.name));
                    if (ext)
                        extensions.add(ext);
                }
            }
        };
        for (const dir of this.views)
            walk(dir, 0);
        return extensions;
    }
    watchViews() {
        const visited = new Set();
        const watchDir = (dir, depth) => {
            const resolved = path.resolve(dir);
            if (depth > 6 || visited.has(resolved))
                return;
            visited.add(resolved);
            let stats;
            try {
                stats = fs.statSync(resolved);
            }
            catch {
                return;
            }
            if (!stats.isDirectory())
                return;
            try {
                const watcher = fs.watch(resolved, () => this.engine.clearCache());
                watcher.unref?.();
                this.dirWatchers.push(watcher);
            }
            catch {
                // Dosya izleme desteklenmiyorsa sessizce devam et
            }
            let entries;
            try {
                entries = fs.readdirSync(resolved, { withFileTypes: true });
            }
            catch {
                return;
            }
            for (const entry of entries) {
                if (!entry.isDirectory())
                    continue;
                if (entry.name === 'node_modules' || entry.name.startsWith('.'))
                    continue;
                watchDir(path.join(resolved, entry.name), depth + 1);
            }
        };
        for (const dir of this.views)
            watchDir(dir, 0);
    }
    /** Aynı uygulamaya ikinci kez kurulum yapılmasını engeller. */
    static mount(app, options = {}) {
        const mounted = app?.[constants_1.VIEW_ENGINE_MOUNT];
        if (mounted) {
            if (options.debug) {
                console.warn('[EmbedView] ViewEngine bu uygulamaya zaten kurulu; mevcut örnek döndürülüyor.');
            }
            return mounted;
        }
        return new ViewEngine(app, options);
    }
}
exports.ViewEngine = ViewEngine;
//# sourceMappingURL=view-engine.js.map