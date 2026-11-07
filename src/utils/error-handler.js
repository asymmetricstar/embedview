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
exports.createDefaultErrorHandler = createDefaultErrorHandler;
const path = __importStar(require("path"));
function createDefaultErrorHandler(rootPath) {
    const root = rootPath ? path.resolve(rootPath) : process.cwd();
    return (err, type) => {
        const style = 'color:#fff;background:#d32f2f;padding:10px;border:2px solid #b71c1c;border-radius:5px;font-family:monospace;margin:10px 0;display:block;';
        let cleanStack = err.stack || '';
        cleanStack = cleanStack.split(root).join('.');
        return `<div style="${style}">
                    <strong style="display:block;border-bottom:1px solid #ffcdd2;margin-bottom:5px;padding-bottom:2px;">[EmbedView ${type}]</strong>
                    <div style="font-size:14px;">${err.name}: ${err.message}</div>
                    ${process.env.NODE_ENV !== 'production' ? `<pre style="font-size:11px;margin-top:10px;white-space:pre-wrap;opacity:0.8;">${cleanStack}</pre>` : ''}
                </div>`;
    };
}
//# sourceMappingURL=error-handler.js.map