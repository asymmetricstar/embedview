import { EngineOptions, GlobalScope, ParseResult } from '../types';
export interface ContextDependencies {
    options: Required<EngineOptions>;
    outputBuffer: string[];
    globals: GlobalScope;
    isPathAllowed: (targetPath: string) => boolean;
    applyFilter: (value: any, filterName: string, ...args: any[]) => any;
    includePartial: (name: string, data?: Record<string, any>) => Promise<string>;
    resolveTemplate: (name: string, baseDir?: string) => string | null;
    parseFileAsync: (filePath: string, locals?: Record<string, any>, blocks?: Record<string, string>, importStack?: string[]) => Promise<ParseResult>;
    onError: (error: Error) => void;
}
export declare function createTemplateContext(deps: ContextDependencies, filePath: string, locals?: Record<string, any>, blocks?: Record<string, string>, importStack?: string[]): any;
//# sourceMappingURL=context.d.ts.map