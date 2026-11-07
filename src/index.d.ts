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
export { EmbedView, defaultFilters } from './core/embed-view';
export { ViewEngine } from './view-engine/view-engine';
export type { CompiledTemplate, EngineOptions, FilterMap, ParseResult, PathUtils, PluginContext, ViewEngineHost, ViewRenderFn, ViewRenderOptions, ViewEngineOptions } from './types';
//# sourceMappingURL=index.d.ts.map