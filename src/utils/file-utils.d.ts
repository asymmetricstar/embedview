/**
 * `index.html?var1=test` biçimindeki girdiyi dosya yolu ve sorgu
 * parametrelerine ayırır. Sorgu yoksa boş nesne döner.
 */
export declare function splitPathAndQuery(input: string): {
    path: string;
    query: Record<string, string>;
};
/** `a=1&b=2` ya da `?a=1&b=2` metnini düz bir anahtar/değer nesnesine çevirir. */
export declare function parseQuery(raw: string): Record<string, string>;
/**
 * GET/POST verisini anahtar/değer nesnesine dönüştürür.
 * Nesneler doğrudan kopyalanır, metinler önce JSON sonra sorgu olarak denenir.
 */
export declare function toVars(value: any): Record<string, any>;
/**
 * Render bağlamındaki GET ve POST değişkenlerini toplar.
 *
 * GET:  locals.get, locals.query, locals.url sorgusu, locals.request/req.query
 * POST: locals.post, locals.body, locals.request/req.body
 */
export declare function collectRequestVars(locals?: Record<string, any>): {
    get: Record<string, any>;
    post: Record<string, any>;
};
/** Hedef yolun verilen kök dizinin içinde kalıp kalmadığını söyler. */
export declare function isInsideRoot(target: string, root: string): boolean;
/** Uzantı listesini noktalı, küçük harfli ve benzersiz hale getirir. */
export declare function normalizeExtensions(extensions?: string[]): string[];
/**
 * Bir şablon adını mevcut bir dosyaya çözer.
 *
 * Sıra: verilen yolun kendisi, sonra uzantılar (.emv → .html → .js).
 * Kök dizinler sırayla denenir; göreli adlar her köke göre çözülür.
 */
export declare function resolveExistingFile(input: string, roots: string[], extensions: string[]): string | null;
//# sourceMappingURL=file-utils.d.ts.map