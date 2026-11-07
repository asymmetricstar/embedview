"use strict";
/**
 * embedview — tek public giriş noktası.
 *
 * Dizin düzeni:
 *   src/core/        Motor çekirdeği: embed-view, compiler, context
 *   src/builtins/    Yerleşik genişletme noktaları: filters, plugins
 *   src/utils/       Yardımcılar: constants, error-handler, file-utils, path-utils
 *   src/types/       Paylaşılan tip sözleşmesi (index.ts)
 *   src/view-engine/ Framework bağımsız view engine adaptörü
 *
 * Alt klasörler birbirini bu barrel üzerinden değil, doğrudan göreli yollarla
 * import eder; dışarıya açılan yüzey yalnızca burasıdır.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewEngine = exports.defaultFilters = exports.EmbedView = void 0;
var embed_view_1 = require("./core/embed-view");
Object.defineProperty(exports, "EmbedView", { enumerable: true, get: function () { return embed_view_1.EmbedView; } });
Object.defineProperty(exports, "defaultFilters", { enumerable: true, get: function () { return embed_view_1.defaultFilters; } });
var view_engine_1 = require("./view-engine/view-engine");
Object.defineProperty(exports, "ViewEngine", { enumerable: true, get: function () { return view_engine_1.ViewEngine; } });
//# sourceMappingURL=index.js.map