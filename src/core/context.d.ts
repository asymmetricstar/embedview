import { EngineOptions, GlobalScope, ParseResult } from '../types';
/**
 * createContext'in motor üzerinde ihtiyaç duyduğu bağımlılıklar.
 * Sınıf bunları bu modüle enjekte eder; modül kendi içinde this bilmez.
 */
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
/**
 * vm.runInContext için çalışma-zamanı bağlamı (sandbox) üretir.
 * Şablon kodu bu nesne üzerinden dosya, filtre, include ve ağ erişimine ulaşır.
 */
export declare function createTemplateContext(deps: ContextDependencies, filePath: string, locals?: Record<string, any>, blocks?: Record<string, string>, importStack?: string[]): any;
//# sourceMappingURL=context.d.ts.map