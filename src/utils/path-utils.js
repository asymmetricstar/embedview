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
exports.createPathUtils = createPathUtils;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function createPathUtils(filePath, isPathAllowed) {
    const dir = filePath === 'inline' ? process.cwd() : path.dirname(filePath);
    const file = filePath === 'inline' ? '' : filePath;
    return {
        __dir: dir,
        __file: file,
        cwd: () => process.cwd(),
        join: (...segments) => {
            const res = path.join(dir, ...segments);
            if (!isPathAllowed(res))
                throw new Error(`Access denied to path: ${segments.join('/')}`);
            return res;
        },
        resolve: (...segments) => {
            const res = path.resolve(dir, ...segments);
            if (!isPathAllowed(res))
                throw new Error(`Access denied to path: ${segments.join('/')}`);
            return res;
        },
        basename: (p, ext) => path.basename(p, ext),
        dirname: (p) => path.dirname(p),
        extname: (p) => path.extname(p),
        relative: (from, to) => path.relative(path.resolve(dir, from), path.resolve(dir, to)),
        exists: (p) => {
            const res = path.isAbsolute(p) ? p : path.join(dir, p);
            if (!isPathAllowed(res))
                return false;
            return fs.existsSync(res);
        },
        ls: (p) => {
            const target = p ? (path.isAbsolute(p) ? p : path.join(dir, p)) : dir;
            if (!isPathAllowed(target))
                throw new Error(`Access denied to path: ${p || '.'}`);
            return fs.readdirSync(target);
        }
    };
}
//# sourceMappingURL=path-utils.js.map