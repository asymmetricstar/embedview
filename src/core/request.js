"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runWithRequest = runWithRequest;
exports.currentRequest = currentRequest;
exports.ensureRequestBody = ensureRequestBody;
const async_hooks_1 = require("async_hooks");
const requestScope = new async_hooks_1.AsyncLocalStorage();
const BODY_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const pendingBodies = new WeakMap();
function runWithRequest(request, fn) {
    return requestScope.run(request, fn);
}
function currentRequest() {
    return requestScope.getStore();
}
function ensureRequestBody(request) {
    if (!request || typeof request !== 'object')
        return Promise.resolve();
    const existing = pendingBodies.get(request);
    if (existing)
        return existing;
    const task = parseBody(request).finally(() => {
        request.__embedviewBodyParsed = true;
        pendingBodies.delete(request);
    });
    pendingBodies.set(request, task);
    return task;
}
async function parseBody(request) {
    if (request.__embedviewBodyParsed)
        return;
    const method = String(request.method || 'GET').toUpperCase();
    if (!BODY_METHODS.has(method))
        return;
    if (request.body && typeof request.body === 'object')
        return;
    const contentType = String(request.headers?.['content-type'] || '').toLowerCase();
    const isJson = contentType.includes('application/json');
    const isForm = contentType.includes('application/x-www-form-urlencoded');
    if (!isJson && !isForm)
        return;
    if (typeof request[Symbol.asyncIterator] !== 'function')
        return;
    const chunks = [];
    try {
        for await (const chunk of request) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }
    }
    catch {
        return;
    }
    const raw = Buffer.concat(chunks).toString('utf8');
    if (!raw.trim()) {
        request.body = request.body ?? {};
        return;
    }
    if (isJson) {
        try {
            request.body = JSON.parse(raw);
        }
        catch {
            request.body = {};
        }
        return;
    }
    request.body = Object.fromEntries(new URLSearchParams(raw));
}
//# sourceMappingURL=request.js.map