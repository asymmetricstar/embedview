/** Hata tipini (RuntimeError, FatalError, FileNotFound...) HTML'e çeviren fonksiyon. */
export type ErrorHandler = (err: Error, type: string) => string;
/**
 * Motorun varsayılan hata sayfası üreticisi.
 * Mutlak proje yolunu stack trace içinde '.' ile maskeler.
 */
export declare function createDefaultErrorHandler(rootPath?: string): ErrorHandler;
//# sourceMappingURL=error-handler.d.ts.map