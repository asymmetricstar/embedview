/** compileTemplate için gerekli motor ayarları. */
export interface CompileOptions {
    delimiter: string;
    timeout: number;
}
/**
 * Şablon içindeki import/require sözdizimini CommonJS require'a çevirir
 * ve `sync` anahtar kelimesini async fonksiyona dönüştürür.
 */
export declare function transpileImports(code: string): string;
export declare function escapeString(str: string): string;
export declare function escapeForTemplateLiteral(str: string): string;
/**
 * HTML şablonunu asenkron bir render fonksiyonuna derler.
 * Derleme hatalarında dosya adı ve üretilen kod ile birlikte fırlatır.
 */
export declare function compileTemplate(html: string, filePath: string, options: CompileOptions): (context: any) => Promise<string>;
//# sourceMappingURL=compiler.d.ts.map