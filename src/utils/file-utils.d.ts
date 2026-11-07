export declare function splitPathAndQuery(input: string): {
    path: string;
    query: Record<string, string>;
};
export declare function parseQuery(raw: string): Record<string, string>;
export declare function toVars(value: any): Record<string, any>;
export declare function collectRequestVars(locals?: Record<string, any>): {
    get: Record<string, any>;
    post: Record<string, any>;
};
export declare function isInsideRoot(target: string, root: string): boolean;
export declare function normalizeExtensions(extensions?: string[]): string[];
export declare function resolveExistingFile(input: string, roots: string[], extensions: string[]): string | null;
//# sourceMappingURL=file-utils.d.ts.map