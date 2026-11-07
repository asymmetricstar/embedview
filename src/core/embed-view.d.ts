import { EventEmitter } from 'events';
import { defaultFilters } from '../builtins/filters';
import { EngineOptions, ParseResult, PluginContext } from '../types';
declare class EmbedView extends EventEmitter {
    private cache;
    private filters;
    private plugins;
    private options;
    private layouts;
    private watchers;
    private outputBuffer;
    constructor(options?: EngineOptions);
    use(plugin: PluginContext): void;
    registerFilter(name: string, fn: (value: any, ...args: any[]) => any): void;
    setglobal(name: string, value: any): this;
    getglobal(name: string): any;
    hasglobal(name: string): boolean;
    deleteglobal(name: string): boolean;
    clearglobals(): void;
    getglobals(): Record<string, any>;
    applyFilter(value: any, filterName: string, ...args: any[]): any;
    watch(filePath: string): void;
    unwatch(filePath: string): void;
    registerLayout(name: string, content: string): void;
    loadLayout(name: string): string | null;
    includePartial(name: string, data?: Record<string, any>): Promise<string>;
    private isPathAllowed;
    resolveTemplate(name: string, baseDir?: string): string | null;
    private withQuery;
    private createContext;
    private renderLayout;
    parseString(htmlString: string, basePath?: string, locals?: Record<string, any>): ParseResult;
    parseFile(filePath: string, locals?: Record<string, any>): ParseResult;
    parseStringAsync(htmlString: string, basePath?: string, locals?: Record<string, any>, blocks?: Record<string, string>, importStack?: string[]): Promise<ParseResult>;
    parseFileAsync(filePath: string, locals?: Record<string, any>, blocks?: Record<string, string>, importStack?: string[]): Promise<ParseResult>;
    renderFile(filePath: string, locals?: Record<string, any>): Promise<string>;
    static renderFile(filePath: string, locals?: Record<string, any>, options?: EngineOptions): Promise<string>;
    handler(filePath: string): (request: any, response: any) => Promise<void>;
    precompile(filePath: string, outputPath: string): Promise<boolean>;
    clearCache(filePath?: string): void;
    getCacheStats(): {
        size: number;
        entries: string[];
    };
    attachExit(): void;
    destroy(): void;
}
export { EmbedView, defaultFilters };
//# sourceMappingURL=embed-view.d.ts.map