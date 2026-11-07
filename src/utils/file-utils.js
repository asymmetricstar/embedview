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
exports.splitPathAndQuery = splitPathAndQuery;
exports.parseQuery = parseQuery;
exports.toVars = toVars;
exports.collectRequestVars = collectRequestVars;
exports.isInsideRoot = isInsideRoot;
exports.normalizeExtensions = normalizeExtensions;
exports.resolveExistingFile = resolveExistingFile;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function splitPathAndQuery(input) {
    const raw = String(input ?? '');
    const index = raw.indexOf('?');
    if (index === -1)
        return { path: raw, query: Object.create(null) };
    return { path: raw.slice(0, index), query: parseQuery(raw.slice(index + 1)) };
}
function parseQuery(raw) {
    const result = Object.create(null);
    const text = String(raw ?? '').replace(/^\?/, '');
    if (!text)
        return result;
    const params = new URLSearchParams(text);
    params.forEach((value, key) => {
        result[key] = value;
    });
    return result;
}
function toVars(value) {
    const result = Object.create(null);
    if (value === undefined || value === null)
        return result;
    if (typeof value === 'string') {
        const text = value.trim();
        if (!text)
            return result;
        if (text.startsWith('{')) {
            try {
                const parsed = JSON.parse(text);
                if (parsed && typeof parsed === 'object')
                    return Object.assign(result, parsed);
            }
            catch {
            }
        }
        return Object.assign(result, parseQuery(text));
    }
    if (typeof value === 'object') {
        return Object.assign(result, value);
    }
    return result;
}
function collectRequestVars(locals) {
    const source = locals ?? {};
    const request = source.request ?? source.req ?? {};
    const get = Object.create(null);
    Object.assign(get, toVars(request.query));
    if (typeof request.url === 'string')
        Object.assign(get, splitPathAndQuery(request.url).query);
    if (typeof source.url === 'string')
        Object.assign(get, splitPathAndQuery(source.url).query);
    Object.assign(get, toVars(source.get));
    Object.assign(get, toVars(source.query));
    const post = Object.create(null);
    Object.assign(post, toVars(request.body));
    Object.assign(post, toVars(source.post));
    Object.assign(post, toVars(source.body));
    return { get, post };
}
function isInsideRoot(target, root) {
    const resolvedRoot = path.resolve(root);
    const resolvedTarget = path.resolve(target);
    const relative = path.relative(resolvedRoot, resolvedTarget);
    return relative === '' || (relative !== '..' &&
        !relative.startsWith(`..${path.sep}`) &&
        !path.isAbsolute(relative));
}
function normalizeExtensions(extensions) {
    if (!extensions)
        return [];
    return Array.from(new Set(extensions
        .map(ext => ext.trim().toLowerCase())
        .filter(ext => ext.length > 0)
        .map(ext => (ext.startsWith('.') ? ext : `.${ext}`))));
}
function isAllowedExtension(filePath, extensions) {
    if (extensions.length === 0)
        return true;
    return extensions.includes(path.extname(filePath).toLowerCase());
}
function isFile(filePath) {
    try {
        return fs.statSync(filePath).isFile();
    }
    catch {
        return false;
    }
}
function resolveExistingFile(input, roots, extensions) {
    const clean = String(input ?? '').trim();
    if (!clean)
        return null;
    const allowed = normalizeExtensions(extensions);
    const targets = path.isAbsolute(clean)
        ? [path.resolve(clean)]
        : roots.map(root => path.resolve(root, clean));
    for (const target of targets) {
        if (isFile(target) && isAllowedExtension(target, allowed))
            return target;
    }
    for (const target of targets) {
        for (const ext of allowed) {
            const candidate = `${target}${ext}`;
            if (isFile(candidate))
                return candidate;
        }
    }
    return null;
}
//# sourceMappingURL=file-utils.js.map