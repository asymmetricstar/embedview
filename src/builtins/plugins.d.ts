import { PluginContext } from '../types';
export declare function runPluginsOnParse(plugins: PluginContext[], html: string): string;
export declare function runPluginsOnRender(plugins: PluginContext[], html: string): string;
export declare function runPluginsOnError(plugins: PluginContext[], error: Error): void;
//# sourceMappingURL=plugins.d.ts.map