"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runPluginsOnParse = runPluginsOnParse;
exports.runPluginsOnRender = runPluginsOnRender;
exports.runPluginsOnError = runPluginsOnError;
function runPluginsOnParse(plugins, html) {
    let result = html;
    for (const plugin of plugins) {
        if (plugin.onParse)
            result = plugin.onParse(result);
    }
    return result;
}
function runPluginsOnRender(plugins, html) {
    let result = html;
    for (const plugin of plugins) {
        if (plugin.onRender)
            result = plugin.onRender(result);
    }
    return result;
}
function runPluginsOnError(plugins, error) {
    for (const plugin of plugins) {
        if (plugin.onError)
            plugin.onError(error);
    }
}
//# sourceMappingURL=plugins.js.map