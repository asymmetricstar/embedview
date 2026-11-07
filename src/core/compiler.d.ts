export interface CompileOptions {
    delimiter: string;
    timeout: number;
}
export declare function transpileImports(code: string): string;
export declare function escapeString(str: string): string;
export declare function escapeForTemplateLiteral(str: string): string;
export declare function compileTemplate(html: string, filePath: string, options: CompileOptions): (context: any) => Promise<string>;
//# sourceMappingURL=compiler.d.ts.map