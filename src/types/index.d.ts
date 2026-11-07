export interface CompiledTemplate {
    fn: (context: any) => Promise<string>;
    mtime: number;
}
export interface EngineOptions {
    cache?: boolean;
    debug?: boolean;
    timeout?: number;
    delimiter?: string;
    allowedModules?: string[];
    layoutsDir?: string;
    partialsDir?: string;
    precompile?: boolean;
    errorHandler?: (err: Error, type: string) => string;
    rootPath?: string;
    allowOutsideRoot?: boolean;
    allowedExtensions?: string[];
}
export interface GlobalScope {
    set(name: string, value: any): any;
    get(name: string): any;
    has(name: string): boolean;
    delete(name: string): boolean;
    clear(): void;
    keys(): string[];
    entries(): Array<[string, any]>;
    toObject(): Record<string, any>;
}
export type FilterMap = Record<string, (value: any, ...args: any[]) => any>;
export interface ParseResult {
    html: string;
    success: boolean;
    error?: string;
    line?: number;
    source?: string;
}
export interface PathUtils {
    __dir: string;
    __file: string;
    cwd: () => string;
    join: (...segments: string[]) => string;
    resolve: (...segments: string[]) => string;
    basename: (p: string, ext?: string) => string;
    dirname: (p: string) => string;
    extname: (p: string) => string;
    relative: (from: string, to: string) => string;
    exists: (p: string) => boolean;
    ls: (p?: string) => string[];
}
export interface PluginContext {
    name?: string;
    helpers?: FilterMap;
    onParse?: (html: string) => string;
    onRender?: (html: string) => string;
    onError?: (error: Error) => void;
}
export interface ViewEngineHost {
    engine?: (extension: string, fn: ViewRenderFn) => any;
    set?: (setting: string, value: any) => any;
    get?: (setting: string) => any;
    [key: string]: any;
}
export type ViewRenderFn = (filePath: string, options: ViewRenderOptions, callback: (err: Error | null, html?: string) => void) => void;
export interface ViewRenderOptions {
    settings?: Record<string, any>;
    [key: string]: any;
}
export interface ViewEngineOptions {
    views?: string | string[];
    extension?: string;
    aliases?: string[];
    override?: boolean;
    cache?: boolean;
    debug?: boolean;
    watch?: boolean;
    timeout?: number;
    delimiter?: string;
    allowedModules?: string[];
    layoutsDir?: string;
    partialsDir?: string;
    precompile?: boolean;
    errorHandler?: (err: Error, type: string) => string;
    rootPath?: string;
    allowOutsideRoot?: boolean;
    allowedExtensions?: string[];
    errorPage?: 'overlay' | 'error';
}
//# sourceMappingURL=index.d.ts.map