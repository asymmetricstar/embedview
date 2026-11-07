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
exports.defaultFilters = exports.EmbedView = void 0;
const events_1 = require("events");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const vm = __importStar(require("vm"));
const compiler_1 = require("./compiler");
const globals_1 = require("./globals");
const context_1 = require("./context");
const request_1 = require("./request");
const error_handler_1 = require("../utils/error-handler");
const filters_1 = require("../builtins/filters");
Object.defineProperty(exports, "defaultFilters", { enumerable: true, get: function () { return filters_1.defaultFilters; } });
const plugins_1 = require("../builtins/plugins");
const constants_1 = require("../utils/constants");
const file_utils_1 = require("../utils/file-utils");
class EmbedView extends events_1.EventEmitter {
    constructor(options = {}) {
        super();
        this.cache = new Map();
        this.filters = { ...filters_1.defaultFilters };
        this.plugins = [];
        this.layouts = new Map();
        this.watchers = new Map();
        this.outputBuffer = [];
        this.options = {
            cache: options.cache ?? false,
            debug: options.debug ?? false,
            timeout: options.timeout ?? 5000,
            delimiter: options.delimiter ?? '<?js',
            allowedModules: options.allowedModules ?? [],
            layoutsDir: options.layoutsDir ?? path.join(process.cwd(), 'layouts'),
            partialsDir: options.partialsDir ?? path.join(process.cwd(), 'partials'),
            precompile: options.precompile ?? true,
            errorHandler: options.errorHandler ?? (0, error_handler_1.createDefaultErrorHandler)(options.rootPath),
            rootPath: path.resolve(options.rootPath ?? process.cwd()),
            allowOutsideRoot: options.allowOutsideRoot ?? false,
            allowedExtensions: options.allowedExtensions ?? constants_1.DEFAULT_TEMPLATE_EXTENSIONS
        };
    }
    use(plugin) {
        this.plugins.push(plugin);
        if (plugin.helpers) {
            Object.assign(this.filters, plugin.helpers);
        }
    }
    registerFilter(name, fn) {
        this.filters[name] = fn;
    }
    setglobal(name, value) {
        globals_1.globalStore.set(name, value);
        return this;
    }
    getglobal(name) {
        return globals_1.globalStore.get(name);
    }
    hasglobal(name) {
        return globals_1.globalStore.has(name);
    }
    deleteglobal(name) {
        return globals_1.globalStore.delete(name);
    }
    clearglobals() {
        globals_1.globalStore.clear();
    }
    getglobals() {
        return globals_1.globalStore.toObject();
    }
    applyFilter(value, filterName, ...args) {
        const filter = this.filters[filterName];
        if (!filter) {
            if (this.options.debug) {
                console.warn(`[EmbedView] Filter "${filterName}" not found`);
            }
            return value;
        }
        return filter(value, ...args);
    }
    watch(filePath) {
        const target = path.resolve(filePath);
        if (this.watchers.has(target))
            return;
        const watcher = fs.watch(target, (eventType) => {
            if (eventType === 'change') {
                this.cache.delete(target);
                this.emit('reload', target);
            }
        });
        this.watchers.set(target, watcher);
    }
    unwatch(filePath) {
        const target = path.resolve(filePath);
        const watcher = this.watchers.get(target);
        if (watcher) {
            watcher.close();
            this.watchers.delete(target);
        }
    }
    registerLayout(name, content) {
        this.layouts.set(name, content);
    }
    loadLayout(name) {
        const target = this.resolveTemplate(name, this.options.layoutsDir);
        if (target) {
            try {
                return fs.readFileSync(target, 'utf8');
            }
            catch {
            }
        }
        return this.layouts.get(name) ?? null;
    }
    async includePartial(name, data) {
        const target = this.resolveTemplate(name, this.options.partialsDir);
        if (!target) {
            return this.options.debug ? `<!-- Partial "${name}" not found or not allowed -->` : '';
        }
        const result = await this.parseFileAsync(target, data);
        return result.html;
    }
    isPathAllowed(targetPath) {
        if (this.options.allowOutsideRoot)
            return true;
        const root = this.options.rootPath;
        const resolved = path.resolve(targetPath);
        if (!(0, file_utils_1.isInsideRoot)(resolved, root))
            return false;
        try {
            const realRoot = fs.realpathSync(root);
            const realTarget = fs.existsSync(resolved) ? fs.realpathSync(resolved) : resolved;
            return (0, file_utils_1.isInsideRoot)(realTarget, realRoot);
        }
        catch {
            return true;
        }
    }
    resolveTemplate(name, baseDir) {
        const clean = (0, file_utils_1.splitPathAndQuery)(name).path;
        const roots = baseDir ? [baseDir, this.options.rootPath] : [this.options.rootPath];
        const resolved = (0, file_utils_1.resolveExistingFile)(clean, roots, this.options.allowedExtensions);
        if (!resolved || !this.isPathAllowed(resolved))
            return null;
        return resolved;
    }
    withQuery(locals, query) {
        if (Object.keys(query).length === 0)
            return locals;
        const existing = locals?.query && typeof locals.query === 'object' && !Array.isArray(locals.query)
            ? locals.query
            : {};
        return { ...locals, query: { ...query, ...existing } };
    }
    createContext(filePath, locals, blocks = {}, importStack = []) {
        return (0, context_1.createTemplateContext)({
            options: this.options,
            outputBuffer: this.outputBuffer,
            isPathAllowed: (targetPath) => this.isPathAllowed(targetPath),
            applyFilter: (value, filterName, ...args) => this.applyFilter(value, filterName, ...args),
            globals: globals_1.globalStore,
            includePartial: (name, data) => this.includePartial(name, data),
            resolveTemplate: (name, baseDir) => this.resolveTemplate(name, baseDir),
            parseFileAsync: (filePath, locals, blocks, importStack) => this.parseFileAsync(filePath, locals, blocks, importStack),
            onError: (error) => (0, plugins_1.runPluginsOnError)(this.plugins, error)
        }, filePath, locals, blocks, importStack);
    }
    async renderLayout(contextObj, locals, importStack = []) {
        if (!contextObj.__layout)
            return null;
        const layoutPath = this.resolveTemplate(contextObj.__layout, this.options.layoutsDir);
        if (!layoutPath) {
            throw new Error(`Layout not found or not allowed: ${contextObj.__layout}`);
        }
        let layoutHtml = await fs.promises.readFile(layoutPath, 'utf8');
        layoutHtml = layoutHtml.replace(/\{@render\s+(\w+)\}/g, (_, name) => {
            return contextObj.blocks[name] || '';
        });
        return this.parseStringAsync(layoutHtml, layoutPath, locals, contextObj.blocks, importStack);
    }
    parseString(htmlString, basePath, locals) {
        throw new Error('parseString is deprecated. Use parseStringAsync.');
    }
    parseFile(filePath, locals) {
        throw new Error('parseFile is deprecated. Use parseFileAsync.');
    }
    async parseStringAsync(htmlString, basePath, locals, blocks = {}, importStack = []) {
        const ambient = (0, request_1.currentRequest)();
        if (ambient)
            await (0, request_1.ensureRequestBody)(ambient);
        try {
            let html = (0, plugins_1.runPluginsOnParse)(this.plugins, htmlString);
            const compiled = (0, compiler_1.compileTemplate)(html, basePath || 'inline', {
                delimiter: this.options.delimiter,
                timeout: this.options.timeout
            });
            const contextObj = this.createContext(basePath || 'inline', locals, blocks, importStack);
            const context = vm.createContext(contextObj);
            let resultHtml = await compiled(context);
            if (this.options.debug) {
                console.log('[DEBUG] Child resultHtml length:', resultHtml.length);
                console.log('[DEBUG] Blocks defined:', Object.keys(contextObj.blocks));
            }
            const layoutResult = await this.renderLayout(contextObj, locals, importStack);
            if (layoutResult)
                return layoutResult;
            return { html: (0, plugins_1.runPluginsOnRender)(this.plugins, resultHtml), success: true };
        }
        catch (e) {
            (0, plugins_1.runPluginsOnError)(this.plugins, e);
            return {
                html: this.options.errorHandler(e, "FatalError"),
                success: false,
                error: e.message
            };
        }
    }
    async parseFileAsync(filePath, locals, blocks = {}, importStack = []) {
        const ambient = (0, request_1.currentRequest)();
        if (ambient)
            await (0, request_1.ensureRequestBody)(ambient);
        const { path: cleanPath, query } = (0, file_utils_1.splitPathAndQuery)(filePath);
        const renderLocals = this.withQuery(locals, query);
        try {
            const target = this.resolveTemplate(cleanPath);
            if (!target) {
                const err = new Error(`File not found or not allowed: ${filePath}`);
                return {
                    html: this.options.errorHandler(err, "FileNotFound"),
                    success: false,
                    error: err.message
                };
            }
            const stats = fs.statSync(target);
            if (this.options.cache && this.cache.has(target)) {
                const entry = this.cache.get(target);
                if (entry.mtime === stats.mtimeMs) {
                    const contextObj = this.createContext(target, renderLocals, blocks, importStack);
                    const context = vm.createContext(contextObj);
                    let resultHtml = await entry.fn(context);
                    const cachedLayoutResult = await this.renderLayout(contextObj, renderLocals, importStack);
                    if (cachedLayoutResult)
                        return cachedLayoutResult;
                    return { html: resultHtml, success: true };
                }
            }
            const contents = await fs.promises.readFile(target, 'utf8');
            const compiledFn = (0, compiler_1.compileTemplate)(contents, target, {
                delimiter: this.options.delimiter,
                timeout: this.options.timeout
            });
            if (this.options.cache) {
                this.cache.set(target, { fn: compiledFn, mtime: stats.mtimeMs });
            }
            const contextObj = this.createContext(target, renderLocals, blocks, importStack);
            const context = vm.createContext(contextObj);
            let resultHtml = await compiledFn(context);
            const layoutResult = await this.renderLayout(contextObj, renderLocals, importStack);
            if (layoutResult)
                return layoutResult;
            return { html: resultHtml, success: true };
        }
        catch (e) {
            (0, plugins_1.runPluginsOnError)(this.plugins, e);
            return {
                html: this.options.errorHandler(e, "FatalError"),
                success: false,
                error: e.message
            };
        }
    }
    async renderFile(filePath, locals) {
        const result = await this.parseFileAsync(filePath, locals);
        if (result.success)
            return result.html;
        const error = new Error(result.error || `Failed to render: ${filePath}`);
        error.view = filePath;
        if (result.line !== undefined)
            error.line = result.line;
        if (result.source !== undefined)
            error.source = result.source;
        throw error;
    }
    static async renderFile(filePath, locals, options = {}) {
        const engine = new EmbedView(options);
        try {
            return await engine.renderFile(filePath, locals);
        }
        finally {
            engine.destroy();
        }
    }
    handler(filePath) {
        return async (request, response) => {
            try {
                const html = await (0, request_1.runWithRequest)(request, () => this.renderFile(filePath));
                response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                response.end(html);
            }
            catch (error) {
                response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                response.end(error instanceof Error ? error.message : String(error));
            }
        };
    }
    async precompile(filePath, outputPath) {
        try {
            const result = await this.parseFileAsync(filePath);
            if (!result.success)
                return false;
            await fs.promises.writeFile(outputPath, `module.exports = ${JSON.stringify(result.html)};`, 'utf8');
            return true;
        }
        catch {
            return false;
        }
    }
    clearCache(filePath) {
        if (filePath)
            this.cache.delete(path.resolve(filePath));
        else
            this.cache.clear();
    }
    getCacheStats() {
        return { size: this.cache.size, entries: Array.from(this.cache.keys()) };
    }
    attachExit() {
        const self = this;
        process.on('SIGINT', () => {
            if (self.options.debug)
                console.log('\n[EmbedView] SIGINT received, cleaning up...');
            self.destroy();
            process.exit(0);
        });
        process.on('SIGTERM', () => {
            if (self.options.debug)
                console.log('\n[EmbedView] SIGTERM received, cleaning up...');
            self.destroy();
            process.exit(0);
        });
        process.on('uncaughtException', (err) => {
            if (self.options.debug)
                console.error('[EmbedView] Uncaught exception:', err);
            self.destroy();
            process.exit(1);
        });
        process.on('unhandledRejection', (reason) => {
            if (self.options.debug)
                console.error('[EmbedView] Unhandled rejection:', reason);
            self.destroy();
            process.exit(1);
        });
    }
    destroy() {
        this.watchers.forEach((w) => w.close());
        this.watchers.clear();
        this.cache.clear();
        this.plugins = [];
    }
}
exports.EmbedView = EmbedView;
//# sourceMappingURL=embed-view.js.map