"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_TEMPLATE_EXTENSIONS = exports.BUILTIN_VIEW_EXTENSIONS = exports.DEFAULT_VIEW_EXTENSION = exports.VIEW_ENGINE_REQUEST_SCOPE = exports.VIEW_ENGINE_RENDER_PATCH = exports.VIEW_ENGINE_MOUNT = void 0;
exports.VIEW_ENGINE_MOUNT = Symbol.for('embedview.view-engine');
exports.VIEW_ENGINE_RENDER_PATCH = Symbol.for('embedview.view-engine.render');
exports.VIEW_ENGINE_REQUEST_SCOPE = Symbol.for('embedview.view-engine.request-scope');
exports.DEFAULT_VIEW_EXTENSION = 'emv';
exports.BUILTIN_VIEW_EXTENSIONS = ['emv', 'html', 'js'];
exports.DEFAULT_TEMPLATE_EXTENSIONS = ['.emv', '.html', '.js'];
//# sourceMappingURL=constants.js.map