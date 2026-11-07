"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.transpileImports = transpileImports;
exports.escapeString = escapeString;
exports.escapeForTemplateLiteral = escapeForTemplateLiteral;
exports.compileTemplate = compileTemplate;
const vm = __importStar(require("vm"));
/**
 * Şablon içindeki import/require sözdizimini CommonJS require'a çevirir
 * ve `sync` anahtar kelimesini async fonksiyona dönüştürür.
 */
function transpileImports(code) {
    // Support 'sync' keyword for async functions
    code = code.replace(/\bsync\s+([\w$]+)\s*\(/g, 'async function $1(');
    code = code.replace(/\bsync\s*\(/g, 'async function (');
    code = code.replace(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g, 'const $1 = require("$2");');
    code = code.replace(/import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]([^'"]+)['"]/g, (_, names, mod) => {
        const vars = names.split(',').map((n) => {
            const parts = n.trim().split(/\s+as\s+/);
            return parts.length === 2 ? `${parts[1].trim()}: ${parts[0].trim()}` : parts[0].trim();
        }).join(', ');
        return `const { ${vars} } = require("${mod}");`;
    });
    code = code.replace(/import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g, 'const $1 = require("$2");');
    code = code.replace(/import\s+['"]([^'"]+)['"]/g, 'require("$1");');
    return code;
}
function escapeString(str) {
    return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/`/g, '\\`').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
}
function escapeForTemplateLiteral(str) {
    return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`');
}
/**
 * HTML şablonunu asenkron bir render fonksiyonuna derler.
 * Derleme hatalarında dosya adı ve üretilen kod ile birlikte fırlatır.
 */
function compileTemplate(html, filePath, options) {
    let code = '(async () => {\n';
    code += 'const __output = [];\n';
    code += 'let write = (s) => __output.push(String(s));\n';
    code += 'const __block_stack = [];\n';
    code += 'try {\n';
    const delimiter = options.delimiter;
    const regex = new RegExp(`(${delimiter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?\\?>)`, 'g');
    const parts = html.split(regex);
    /**
     * Metin parçasını yazarken `$getvar("...")` / `$postvar("...")`
     * kalıplarını HTML-escape edilmiş çıktıya çevirir.
     */
    const emitText = (text) => {
        const prepared = text.replace(/\$(getvar|postvar)\s*\(([^()]*)\)/gi, (_match, name, args) => '${escape(' + name.toLowerCase() + '(' + args + '))}');
        return `write(\`${escapeForTemplateLiteral(prepared)}\`);\n`;
    };
    const processTextChunk = (text) => {
        const helperRegex = /(\{@(?:block|render|extend|if|else|for|each|import|include|set|parse|json|try|catch)[\s\S]*?\}|\{@\/(?:block|if|for|each|try)\}|\{\{[\s\S]*?\}\})/g;
        const subParts = text.split(helperRegex);
        for (const sub of subParts) {
            if (!sub)
                continue;
            if (sub.startsWith('{@block')) {
                const match = sub.match(/\{@block\s+(\w+)\}/);
                if (match) {
                    const name = match[1];
                    code += `if(!blocks['${name}']) { 
                        __block_stack.push({ name: '${name}', old_write: write, out: [] });
                        write = (s) => __block_stack[__block_stack.length-1].out.push(s);
                    } else {
                        __block_stack.push({ skip: true });
                    }
                    `;
                }
            }
            else if (sub === '{@/block}') {
                code += `
                    {
                        const __b = __block_stack.pop();
                        if(__b && !__b.skip) {
                            blocks[__b.name] = __b.out.join("");
                            write = __b.old_write;
                        }
                    }
                `;
            }
            else if (sub.startsWith('{@extend')) {
                const match = sub.match(/\{@extend\s+['"]([^'"]+)['"]\}/);
                if (match)
                    code += `__layout = '${match[1]}';\n`;
            }
            else if (sub.startsWith('{@render')) {
                const match = sub.match(/\{@render\s+(\w+)\}/);
                if (match)
                    code += `write(blocks['${match[1]}'] || '');\n`;
            }
            else if (sub.startsWith('{@import') || sub.startsWith('{@include')) {
                const match = sub.match(/\{@(?:import|include)\s+['"]([^'"]+)['"]\}/);
                if (match) {
                    // Import/Include works like a line-based include, it inherits current context
                    code += `write( (await importFile('${match[1]}')).html );\n`;
                }
                else {
                    code += emitText(sub);
                }
            }
            else if (sub.startsWith('{@set')) {
                const match = sub.match(/\{@set\s+(\w+)\s*=\s*(.+?)\}/);
                if (match)
                    code += `let ${match[1]} = ${match[2]};\n`;
                else
                    code += emitText(sub);
            }
            else if (sub.startsWith('{@parse')) {
                const match = sub.match(/\{@parse\s+(\w+)\s*=\s*(.+?)\}/);
                if (match)
                    code += `let ${match[1]} = JSON.parse(${match[2]});\n`;
            }
            else if (sub.startsWith('{@json')) {
                const match = sub.match(/\{@json\s+(.+?)\}/);
                if (match)
                    code += `write(JSON.stringify(${match[1]}));\n`;
            }
            else if (sub === '{@try}') {
                code += `try {\n`;
            }
            else if (sub.startsWith('{@catch')) {
                const match = sub.match(/\{@catch\s+(\w+)\}/);
                const errVar = match ? match[1] : 'e';
                code += `} catch(${errVar}) {\n`;
            }
            else if (sub === '{@/try}') {
                code += `}\n`;
            }
            else if (sub.startsWith('{@if')) {
                const match = sub.match(/\{@if\s+(.+?)\}/);
                if (match)
                    code += `if(${match[1]}) {\n`;
            }
            else if (sub === '{@else}') {
                code += `} else {\n`;
            }
            else if (sub === '{@/if}') {
                code += `}\n`;
            }
            else if (sub.startsWith('{@for')) {
                const match = sub.match(/\{@for\s+(\w+)\s+in\s+(.+?)\}/);
                if (match)
                    code += `for(const [index, ${match[1]}] of (Array.from(${match[2]})).entries()) {\n`;
            }
            else if (sub === '{@/for}' || sub === '{@/each}') {
                code += `}\n`;
            }
            else if (sub.startsWith('{@each')) {
                const match = sub.match(/\{@each\s+(\w+)\s+of\s+(.+?)\}/);
                if (match)
                    code += `for(const ${match[1]} of ${match[2]}) {\n`;
            }
            else if (sub.startsWith('{{') && sub.endsWith('}}')) {
                const content = sub.slice(2, -2).trim();
                if (content.includes('|')) {
                    const filterParts = content.split('|');
                    let val = filterParts[0].trim();
                    for (let i = 1; i < filterParts.length; i++) {
                        const filterPart = filterParts[i].trim();
                        const filterMatch = filterPart.match(/^(\w+)(?:\((.*)\))?$/);
                        if (filterMatch) {
                            const name = filterMatch[1];
                            const args = filterMatch[2] ? `, ${filterMatch[2]}` : '';
                            val = `filter(${val}, '${name}'${args})`;
                        }
                    }
                    code += `write(${val});\n`;
                }
                else {
                    code += `write(${content});\n`;
                }
            }
            else {
                code += emitText(sub);
            }
        }
    };
    for (const part of parts) {
        if (part.startsWith(delimiter) && part.endsWith('?>')) {
            const js = part.slice(delimiter.length, -2);
            code += transpileImports(js) + '\n';
        }
        else {
            processTextChunk(part);
        }
    }
    code += '} catch(e) { \n';
    code += '  const errHtml = onError(e, "RuntimeError");\n';
    code += '  if(__block_stack.length > 0) {\n';
    code += '    const __b = __block_stack[__block_stack.length-1];\n';
    code += '    if(!__b.skip) blocks[__b.name] = errHtml;\n';
    code += '  }\n';
    code += '  return errHtml;\n';
    code += '}\n';
    code += 'return __output.join("");\n';
    code += '})();';
    try {
        const script = new vm.Script(code, { filename: filePath });
        return async (context) => {
            return await script.runInContext(context, { timeout: options.timeout });
        };
    }
    catch (e) {
        throw new Error(`Compilation error in ${filePath}: ${e.message}\nCode: ${code}`);
    }
}
//# sourceMappingURL=compiler.js.map