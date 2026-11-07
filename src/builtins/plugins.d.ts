import { PluginContext } from '../types';
/** Kayıtlı tüm eklentilerin onParse kancalarını sırayla uygular. */
export declare function runPluginsOnParse(plugins: PluginContext[], html: string): string;
/** Kayıtlı tüm eklentilerin onRender kancalarını sırayla uygular. */
export declare function runPluginsOnRender(plugins: PluginContext[], html: string): string;
/** Kayıtlı tüm eklentilerin onError kancağını tetikler. */
export declare function runPluginsOnError(plugins: PluginContext[], error: Error): void;
//# sourceMappingURL=plugins.d.ts.map