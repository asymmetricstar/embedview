"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_TEMPLATE_EXTENSIONS = exports.BUILTIN_VIEW_EXTENSIONS = exports.DEFAULT_VIEW_EXTENSION = exports.VIEW_ENGINE_REQUEST_SCOPE = exports.VIEW_ENGINE_RENDER_PATCH = exports.VIEW_ENGINE_MOUNT = void 0;
/** Uygulama başına bir kez monte edildiğini gösteren sembolik anahtar. */
exports.VIEW_ENGINE_MOUNT = Symbol.for('embedview.view-engine');
/** app.render çoklu uzantı yamasının orijinal fonksiyonunu saklayan anahtar. */
exports.VIEW_ENGINE_RENDER_PATCH = Symbol.for('embedview.view-engine.render');
/** İstek kapsamı middleware'inin kurulduğunu gösteren anahtar. */
exports.VIEW_ENGINE_REQUEST_SCOPE = Symbol.for('embedview.view-engine.request-scope');
/** Varsayılan view uzantısı (noktasız). */
exports.DEFAULT_VIEW_EXTENSION = 'emv';
/** Adaptörün varsayılan olarak kaydettiği uzantılar (noktasız). */
exports.BUILTIN_VIEW_EXTENSIONS = ['emv', 'html', 'js'];
/** Şablon çözümlemesinde kullanılan varsayılan uzantılar (noktalı, sıralı). */
exports.DEFAULT_TEMPLATE_EXTENSIONS = ['.emv', '.html', '.js'];
//# sourceMappingURL=constants.js.map