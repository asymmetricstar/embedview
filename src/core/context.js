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
exports.createTemplateContext = createTemplateContext;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const path_utils_1 = require("../utils/path-utils");
const file_utils_1 = require("../utils/file-utils");
const request_1 = require("./request");
/**
 * vm.runInContext için çalışma-zamanı bağlamı (sandbox) üretir.
 * Şablon kodu bu nesne üzerinden dosya, filtre, include ve ağ erişimine ulaşır.
 */
function createTemplateContext(deps, filePath, locals, blocks = {}, importStack = []) {
    const { options, outputBuffer, isPathAllowed } = deps;
    const paths = (0, path_utils_1.createPathUtils)(filePath, isPathAllowed);
    // Aktif istek kapsamı varsa (ViewEngine / handler) locals'a ekle:
    // böylece $getvar / $postvar ek parametre olmadan çalışır.
    const ambient = (0, request_1.currentRequest)();
    const scopedLocals = (locals?.request ?? locals?.req)
        ? locals
        : (ambient ? { ...locals, request: ambient } : locals);
    const requestVars = (0, file_utils_1.collectRequestVars)(scopedLocals);
    /** "user.name" gibi noktalı anahtarlarda iç içe değere iner. */
    const pick = (source, key) => {
        if (key === undefined || key === null || key === '')
            return source;
        return String(key)
            .split('.')
            .reduce((value, part) => (value === undefined || value === null ? undefined : value[part]), source);
    };
    /** İstek değerini türüyle döndürür; eksik değer boş string olur. */
    const requestValue = (source, key) => {
        const value = pick(source, key);
        return value === undefined || value === null ? '' : value;
    };
    const contextObj = {
        console: {
            log: (...args) => { if (options.debug)
                console.log('[DEBUG]', ...args); },
            warn: (...args) => { if (options.debug)
                console.warn('[WARN]', ...args); },
            error: (...args) => { if (options.debug)
                console.error('[ERROR]', ...args); }
        },
        write: (text) => { outputBuffer.push(String(text)); }, // Fallback for old style
        require: (mod) => {
            if (options.allowedModules.length > 0 && !options.allowedModules.includes(mod)) {
                throw new Error(`Module "${mod}" is not allowed`);
            }
            const target = mod.startsWith('.') ? path.resolve(paths.__dir, mod) : mod;
            if (mod.startsWith('.') && !isPathAllowed(target)) {
                throw new Error(`Access denied to module: ${mod}`);
            }
            return require(target);
        },
        include: async (name, data) => await deps.includePartial(name, data),
        importStack: importStack,
        importFile: async (name, data) => {
            const target = deps.resolveTemplate(name, paths.__dir);
            if (!target) {
                throw new Error(`Imported file not found or not allowed: ${name}`);
            }
            if (!isPathAllowed(target)) {
                throw new Error(`Access denied to imported file: ${name}`);
            }
            const resolvedTarget = path.resolve(target);
            if (contextObj.importStack.includes(resolvedTarget)) {
                if (options.debug)
                    console.warn(`[EmbedView] Circular import detected for: ${resolvedTarget}`);
                return { html: `<!-- Circular import detected: ${name} -->`, success: true };
            }
            const newStack = [...contextObj.importStack, resolvedTarget];
            return deps.parseFileAsync(target, { ...locals, ...data }, blocks, newStack);
        },
        filter: (value, filterName, ...args) => deps.applyFilter(value, filterName, ...args),
        escape: (v) => String(v)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;'),
        onError: (err, type) => {
            deps.onError(err);
            return options.errorHandler(err, type);
        },
        /** Ham GET değeri: getvar("ad") veya noktalı getvar("user.name"). */
        getvar: (key) => requestValue(requestVars.get, key),
        /** Ham POST değeri: postvar("ad"). */
        postvar: (key) => requestValue(requestVars.post, key),
        /** Global değer yaz; değeri geri döndürür. */
        setglobal: (name, value) => {
            deps.globals.set(name, value);
            return value;
        },
        /** Global değeri türüyle oku (object, array, number ...). */
        getglobal: (name) => deps.globals.get(name),
        hasglobal: (name) => deps.globals.has(name),
        deleteglobal: (name) => deps.globals.delete(name),
        blocks: blocks,
        __layout: null,
        __filename: paths.__file,
        __dirname: paths.__dir,
        __dir: paths.__dir,
        __file: paths.__file,
        cwd: paths.cwd,
        join: paths.join,
        resolve: paths.resolve,
        basename: paths.basename,
        dirname: paths.dirname,
        extname: paths.extname,
        relative: paths.relative,
        setTimeout,
        setInterval,
        clearTimeout,
        clearInterval,
        setImmediate,
        clearImmediate,
        Buffer,
        fetch: typeof fetch !== 'undefined' ? fetch : undefined,
        fetchJson: async (url, options) => {
            const res = await fetch(url, options);
            return res.json();
        },
        fetchText: async (url, options) => {
            const res = await fetch(url, options);
            return res.text();
        },
        get: async (url, options) => {
            const res = await fetch(url, options);
            return res.json();
        },
        post: async (url, body, options) => {
            const res = await fetch(url, {
                ...options,
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
                body: JSON.stringify(body)
            });
            return res.json();
        },
        put: async (url, body, options) => {
            const res = await fetch(url, {
                ...options,
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
                body: JSON.stringify(body)
            });
            return res.json();
        },
        patch: async (url, body, options) => {
            const res = await fetch(url, {
                ...options,
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
                body: JSON.stringify(body)
            });
            return res.json();
        },
        del: async (url, options) => {
            const res = await fetch(url, { ...options, method: 'DELETE' });
            return res.json();
        },
        read: async (p, encoding = 'utf8') => {
            const target = path.isAbsolute(p) ? p : path.resolve(paths.__dir, p);
            if (!isPathAllowed(target))
                throw new Error(`Access denied to path: ${p}`);
            return fs.promises.readFile(target, encoding);
        },
        exists: async (p) => {
            const target = path.isAbsolute(p) ? p : path.resolve(paths.__dir, p);
            if (!isPathAllowed(target))
                return false;
            return fs.existsSync(target);
        },
        list: async (p = '.') => {
            const target = path.isAbsolute(p) ? p : path.resolve(paths.__dir, p);
            if (!isPathAllowed(target))
                throw new Error(`Access denied to path: ${p}`);
            return fs.promises.readdir(target);
        },
        range: (start, end) => Array.from({ length: end - start + 1 }, (_, i) => start + i),
        sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
        process: { cwd: () => process.cwd(), version: process.version, platform: process.platform, env: process.env },
        ...locals
    };
    return contextObj;
}
//# sourceMappingURL=context.js.map