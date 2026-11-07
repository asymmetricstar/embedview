/** İsteği geçerli async kapsamın içinde çalıştırır. */
export declare function runWithRequest<T>(request: any, fn: () => T): T;
/** Şu an işlenen istek varsa döndürür. */
export declare function currentRequest(): any;
/**
 * URL-encoded veya JSON gövdeyi istek üzerinde bir kez hazırlar.
 * Express `express.urlencoded()` / `express.json()` kullanıldıysa gövde zaten
 * doludur ve bu fonksiyon hiçbir şey yapmaz.
 */
export declare function ensureRequestBody(request: any): Promise<void>;
//# sourceMappingURL=request.d.ts.map