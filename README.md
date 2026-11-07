# Embed View

![Embed View](logo.png)

(Unstable Test Version)

**embedview** is a sequential, asynchronous template engine for Node.js with a
framework-agnostic view adapter. Templates are plain markup with embedded
JavaScript; a template can be rendered on its own with `EmbedView`, or through
Express, a plain `node:http` server, or any container that exposes the
view-engine contract.

- **Embedded** — JavaScript lives inside the markup (`<?js ... ?>`, `${...}`).
- **Sequential** — statements run in document order.
- **Async** — every render returns a Promise; templates can `await`.
- **Framework-agnostic** — `ViewEngine` mounts on App hosts and also
  works without any host at all.
- **Shared globals** — one template can `setglobal()` a value that another
  template reads with `getglobal()`, with its type intact.
- **Safe file access** — rendering and helper calls are confined to `rootPath`
  unless explicitly opened up.

---

## Installation

```bash
npm install embedview
```

Node.js 18 or newer is recommended (the fetch helpers rely on global `fetch`).

---

## Quick start

### One file, no framework

```js
const { EmbedView } = require('embedview');

const html = await EmbedView.renderFile(
    'views/page.emv',
    { title: 'Hello', items: ['one', 'two'] },
    { rootPath: __dirname }
);

console.log(html);
```

`rootPath` defaults to `process.cwd()`. File access, includes and layouts are
resolved against it.

### Express

```js
const path = require('path');
const express = require('express');
const { ViewEngine } = require('embedview');

const app = express();

// Mount before routes: the adapter also installs the request scope.
ViewEngine.mount(app, { views: path.join(__dirname, 'views') });

app.get('/', (request, response) => {
    // "index" → index.emv → index.html → index.js
    response.render('index', { title: 'Home' });
});

app.post('/', (request, response) => {
    response.render('index', { title: 'Home' });
});

app.listen(3000);
```

No query or body extraction is needed: `ViewEngine` puts every request in its
own async scope, so `$getvar` / `$postvar` and `getvar()` / `postvar()` read the
active request automatically. URL-encoded and JSON bodies are parsed by the
package when no other body parser has already done it.

In the template:

```html
<h1>${title}</h1>
<p>GET name: [$getvar("name")]</p>
<p>POST email: [$postvar("email")]</p>
```

### Plain `node:http`

```js
const http = require('http');
const path = require('path');
const { EmbedView } = require('embedview');

const views = path.join(__dirname, 'views');
const engine = new EmbedView({ rootPath: views });

// GET/POST are resolved inside the handler; no request code here.
http.createServer(engine.handler('index.emv')).listen(3000);
```

### Any view-engine host

```js
const { ViewEngine } = require('embedview');

// A host only needs engine(ext, fn), set(key, value) and get(key).
const adapter = new ViewEngine(host, { views: './views' });

// Without a host the same adapter renders directly:
const standalone = new ViewEngine(null, { views: './views' });
const html = await standalone.renderView('index', { title: 'Hello' });
```

---

## Template syntax

A template is text plus three kinds of embedded code.

### Output

| Syntax | Behaviour |
| --- | --- |
| `${expression}` | Evaluates any JavaScript expression and writes the result **raw**. |
| `{{ expression }}` | Same as `${...}`, but also supports filters. |
| `{{ value \| filter }}` | Applies a filter; chain with more pipes. |
| `$getvar("key")` | Writes a **HTML-escaped** GET value. |
| `$postvar("key")` | Writes a **HTML-escaped** POST value. |

`${...}` does not escape HTML. Use `${escape(value)}`, `{{ value | escape }}`,
`$getvar(...)` or `$postvar(...)` whenever the value comes from a user.

### Script blocks

```html
<?js
const total = items.reduce((sum, item) => sum + item.price, 0);
const rows = await read("data/rows.json");   // top-level await is supported
?>
<p>Total: ${total}</p>
```

The default opener is `<?js` and the block ends at `?>`; change the opener with
the `delimiter` option (`?>` stays the closer).

### Control flow

```html
{@if user}
    <p>Hello ${escape(user.name)}</p>
{@else}
    <p>Hello guest</p>
{@/if}

<ul>
{@for item in items}
    <li>${index + 1}. ${escape(item.name)}</li>
{@/for}
</ul>

{@each row of rows}
    <p>${escape(row)}</p>
{@/each}
```

`{@for}` provides `index`; `{@/for}` and `{@/each}` both close either loop.

### Variables and JSON

```html
{@set name = "Levent"}
{@set total = price * qty}
{@parse config = '{"theme":"dark"}'}
{@json config}
```

`{@set}` and `{@parse}` declare block-scoped variables (`let`), so declare a
name once per scope. `{@parse}` runs `JSON.parse` on its expression; for files
use a script block with `await`:

```html
<?js const config = JSON.parse(await read("config.json")); ?>
```

`{@json expr}` writes `JSON.stringify(expr)` raw.

### Includes and layouts

```html
{@include "header"}
{@import "partials/footer"}
```

Both forms render the target file with the current locals and insert the HTML.
The file is resolved next to the current template, then against `rootPath`, with
extension fallback.

```html
<!-- layouts/base.emv -->
<!doctype html>
<html>
<body>
    {@render content}
</body>
</html>
```

```html
<!-- views/page.emv -->
{@extend "base"}
{@block content}
    <h1>${title}</h1>
{@/block}
```

Layouts are looked up in `layoutsDir` (default `<cwd>/layouts`) and then in
`rootPath`. `ViewEngine` defaults `layoutsDir` to the first views directory.

### Error handling

```html
{@try}
    <p>${JSON.parse(payload).name}</p>
{@catch error}
    <p>Invalid payload: ${escape(error.message)}</p>
{@/try}
```

`{@catch}` takes an optional variable name (`e` if omitted). Errors outside a
`{@try}` block are passed to the engine's `errorHandler`.

---

## Request variables

`$getvar("key")` prints an escaped GET value; `$postvar("key")` prints an escaped
POST value. Inside JavaScript (script blocks, `${...}`, `{{...}}`) use the
functions directly:

```html
<?js
const page = Number(getvar("page") || 1);
const email = String(postvar("email") || "").trim();
?>
<p>Page ${page}, email ${escape(email)}</p>
```

### Automatic request scope

There is nothing to pass in. Every render started from `engine.handler(file)`
or from a host-mounted `ViewEngine` runs inside an async request scope:

```js
http.createServer(engine.handler('index.emv')).listen(3000);
```

- GET values come from the request URL querystring (`req.query` when the host
  has already parsed it).
- POST values come from the request body. `application/x-www-form-urlencoded`
  and `application/json` bodies are read and parsed by the package when no
  other parser has consumed them; multipart forms are not parsed.
- The same scope makes `getvar()` / `postvar()` work inside `${...}` and script
  blocks, and it survives the whole async call chain of the request.

When there is no active request (a CLI render, for example), values fall back to
explicit locals:

| Source | Accepted locals |
| --- | --- |
| GET | `get`, `query`, `url` (query string), `request.query` / `req.query` |
| POST | `post`, `body`, `request.body` / `req.body` |

Strings are parsed as JSON first, then as a query string. A query string on the
file name is merged in as well:

```js
await engine.renderFile('index.html?name=Levent');
```

Keys may be dotted to reach nested values: `getvar("user.name")`. A missing
value returns an empty string.

---

## Globals

Globals are shared by every template in the process. Nothing has to be created
or passed in — the store ships inside the package.

```html
<!-- a.html -->
<?js setglobal("greeting", "merhaba"); ?>
```

```html
<!-- b.html -->
<p>$getvar("city")</p>
<p>${getglobal("greeting")}</p>
```

`setglobal(name, value)` stores any value and returns it; `getglobal(name)`
returns it with the original type, so objects, arrays, numbers and booleans work
without serialisation:

```html
<?js
const cart = getglobal("cart") || [];
cart.push({ sku: "A-1", qty: 1, price: 49.9 });

setglobal("cart", cart);
setglobal("cartTotal", cart.reduce((sum, line) => sum + line.qty * line.price, 0));
?>
<p>Items: ${getglobal("cart").length}, total: ${getglobal("cartTotal")}</p>
```

Helpers available in templates:

| Function | Description |
| --- | --- |
| `setglobal(name, value)` | Writes a value, returns it. |
| `getglobal(name)` | Reads a value (any type). |
| `hasglobal(name)` | `true` when the key exists. |
| `deleteglobal(name)` | Removes one key. |

The store lives as long as the process, so `a.html` can set a value that a later
render of `b.html` reads. It is not per request and not per engine instance;
keep per-request data in locals, and clear globals between tests with
`engine.clearglobals()`.

From JavaScript the same store is reachable through the engine:

```js
engine.setglobal('theme', 'dark');
engine.getglobal('theme');      // 'dark'
engine.hasglobal('theme');      // true
engine.deleteglobal('theme');
engine.clearglobals();
engine.getglobals();           // { ... } snapshot
```

---

## File resolution and security

Names are resolved in this order:

1. the exact path,
2. the path plus each extension in `allowedExtensions`
   (default `.emv`, `.html`, `.js`).

This applies to `renderFile`, `parseFileAsync`, `{@include}`, `{@extend}`,
`include()` and `ViewEngine.resolveView` — which is why `res.render('index')`
works without an extension.

- `rootPath` (default `process.cwd()`) is the security boundary.
- `allowOutsideRoot: false` (default) rejects paths outside it, including
  symlink escapes (the real path is checked).
- `allowedExtensions` limits which files may be rendered; a file with any other
  extension is treated as "not found or not allowed".
- Relative includes and `read()`/`list()`/`exists()` are confined to `rootPath`.
- `require()` of a relative module is confined to `rootPath`;
  `allowedModules` can restrict which module names are importable at all.

Templates execute real JavaScript in a `vm` context with `require`, `fetch`,
file helpers and `process.env` available. This is not a hard sandbox: **only run
templates you trust**, keep user data out of executable positions, and escape
values before writing them to HTML.

---

## API reference

### `EmbedView`

```js
const { EmbedView } = require('embedview');
const engine = new EmbedView(options);
```

#### Constructor options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `cache` | `boolean` | `false` | Cache compiled templates by resolved path and mtime. |
| `debug` | `boolean` | `false` | Log diagnostics; also gates template `console`. |
| `timeout` | `number` | `5000` | Max milliseconds for a template run. |
| `delimiter` | `string` | `'<?js'` | Script-block opener; blocks close with `?>`. |
| `allowedModules` | `string[]` | `[]` | When non-empty, only these module names may be required. |
| `layoutsDir` | `string` | `<cwd>/layouts` | Layout lookup directory. |
| `partialsDir` | `string` | `<cwd>/partials` | Directory searched first by `include()`. |
| `precompile` | `boolean` | `true` | Reserved; use the `precompile()` method. |
| `errorHandler` | `(err, type) => string` | built-in page | Produces the HTML shown for a failed render. |
| `rootPath` | `string` | `process.cwd()` | File-access root and relative-resolution base. |
| `allowOutsideRoot` | `boolean` | `false` | Disable the `rootPath` restriction. |
| `allowedExtensions` | `string[]` | `['.emv', '.html', '.js']` | Allowed extensions and resolution order. |

#### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `renderFile(filePath, locals?)` | `Promise<string>` | Renders a file; throws when it cannot be found or executed. |
| `EmbedView.renderFile(filePath, locals?, options?)` | `Promise<string>` | Static form; creates and destroys an engine per call. Globals still persist. |
| `parseFileAsync(filePath, locals?, blocks?, importStack?)` | `Promise<ParseResult>` | Like `renderFile`, but returns `{ html, success, error }` instead of throwing. |
| `parseStringAsync(html, basePath?, locals?, blocks?, importStack?)` | `Promise<ParseResult>` | Renders a template string; `basePath` anchors relative includes. |
| `handler(filePath)` | `(request, response) => Promise<void>` | Zero-plumbing `node:http` listener: request scope, GET/POST parsing, 200/500 response. |
| `parseFile()` / `parseString()` | — | Deprecated; always throw. Use the async versions. |
| `resolveTemplate(name, baseDir?)` | `string \| null` | Resolves a template name safely, without rendering. |
| `includePartial(name, data?)` | `Promise<string>` | Renders a partial; `''` when missing and not in debug mode. |
| `registerLayout(name, content)` | `void` | Registers an in-memory layout. |
| `loadLayout(name)` | `string \| null` | Loads a layout from disk (then memory). |
| `registerFilter(name, fn)` | `void` | Adds or replaces a filter. |
| `applyFilter(value, name, ...args)` | `any` | Applies a filter programmatically. |
| `use(plugin)` | `void` | Adds `helpers` filters and `onParse` / `onRender` / `onError` hooks. |
| `watch(filePath)` | `void` | Watches one file; clears its cache entry and emits `'reload'`. |
| `unwatch(filePath)` | `void` | Stops watching a file. |
| `precompile(filePath, outputPath)` | `Promise<boolean>` | Renders a file and writes `module.exports = "<html>"`. |
| `clearCache(filePath?)` | `void` | Clears one cache entry or the whole cache. |
| `getCacheStats()` | `{ size, entries }` | Current cache contents. |
| `setglobal` / `getglobal` / `hasglobal` / `deleteglobal` | — | Global store access. |
| `clearglobals()` | `void` | Empties the global store. |
| `getglobals()` | `Record<string, any>` | Snapshot of all globals. |
| `attachExit()` | `void` | Cleans up on SIGINT, SIGTERM, uncaught errors and rejections. |
| `destroy()` | `void` | Closes watchers, clears cache and plugins. Globals are not cleared. |

`EmbedView` is an `EventEmitter`; the only event is `'reload'` with the changed
path.

### `ViewEngine`

```js
const { ViewEngine } = require('embedview');

const adapter = new ViewEngine(host, options);   // or new ViewEngine() 
ViewEngine.mount(app, options);                   // idempotent helper
```

A host is any object with `engine(ext, fn)`, `set(key, value)` and `get(key)`.
Without that contract, the adapter skips mounting and `render` / `renderView`
remain usable.

#### Adapter options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `views` | `string \| string[]` | host's `views`, else `<cwd>/views` | Directories searched for views. |
| `extension` | `string` | detected | Primary extension (`.emv`, `.html`, `.js`, ...). Detected by scanning views, else `.emv`. |
| `aliases` | `string[]` | other built-ins | Additional extensions registered with the host. |
| `override` | `boolean` | `false` | Replace an already registered extension. |
| `cache` | `boolean` | `true` in production | Compile cache. |
| `watch` | `boolean` | `!cache` | Clear the cache when view files change. |
| `debug` | `boolean` | `NODE_ENV !== 'production'` | Diagnostics. |
| `errorPage` | `'overlay' \| 'error'` | `'overlay'` | Return the error HTML or throw a decorated error. |
| `rootPath` | `string` | first views directory | File-access root. |
| `allowOutsideRoot` | `boolean` | `false` | Disable the root restriction. |
| `allowedExtensions` | `string[]` | `['.emv', '.html', '.js']` | Allowed extensions. |

All engine options (`timeout`, `delimiter`, `allowedModules`, `layoutsDir`,
`partialsDir`, `errorHandler`, ...) are accepted too. `layoutsDir` and
`partialsDir` default to the first views directory.

#### Properties and methods

| Member | Description |
| --- | --- |
| `app` | The mounted host, or `null`. |
| `engine` | The underlying `EmbedView` instance. |
| `views` | Absolute view directories. |
| `extension` / `aliases` | Primary and additional extensions. |
| `render` | `(filePath, options, callback)` function to hand to a framework. |
| `renderFile(filePath, options?)` | `Promise<string>` alias of `renderView`. |
| `canMount()` | Whether the host exposes `engine` + `set` + `get`. |
| `mount(override?)` | Registers engines and settings; safe to call twice. |
| `resolveView(name)` | Resolves `index` to an existing file (or returns the name unchanged). |
| `renderView(filePath, options?)` | `Promise<string>`; renders without a framework callback. |
| `invalidate(filePath?)` | Clears the cache for one file or all. |
| `destroy()` | Stops watchers, clears cache and restores a patched `app.render`. |

When mounted on an Express-like app, `app.render('index', ...)` is wrapped so
extensionless names resolve through the engine; `destroy()` restores the original
method.

### Filters

Filters are available through `{{ value | filter }}` and `{{ value | filter(args) }}`.
Arguments are JavaScript expressions; filters are applied left to right.

| Filter | Arguments | Result |
| --- | --- | --- |
| `uppercase`, `lowercase` | — | Case conversion. |
| `capitalize` | — | Uppercases the first character. |
| `trim` | — | Trims whitespace. |
| `truncate` | `length = 100` | Cuts the string and appends `...`. |
| `truncateWords` | `count = 20` | Word-safe truncation. |
| `slug` | — | Lowercase, accent-free URL slug. |
| `urlencode` | — | `encodeURIComponent(value)`. |
| `stripTags` | — | Removes HTML tags. |
| `nl2br` | — | Escapes HTML, then turns newlines into `<br>`. |
| `default` | `fallback = ''` | Fallback for `undefined`, `null` and `''`. |
| `json` | — | `JSON.stringify(value)` (not HTML-escaped). |
| `escape` | — | Escapes `& < > " '` for HTML. |
| `length` | — | String or array length. |
| `first`, `last` | — | First/last array element. |
| `join` | `separator = ', '` | Joins an array. |
| `reverse`, `sort` | — | Copies and reverses/sorts an array. |
| `contains` | `search` | String/array membership. |
| `limit` | `count = 10` | Keeps the first N array items. |
| `pluck` | `field` | Maps an array to one field. |
| `where` | `field`, `value` | Filters an array by field equality. |
| `sortBy` | `field`, `direction = 'asc'` | Copies and sorts an array by field. |
| `keys`, `values` | — | Object keys/values. |
| `number` | `decimals = 0`, `locale = 'tr-TR'` | Locale-formatted number. |
| `currency` | `code = 'TRY'`, `locale = 'tr-TR'` | Locale-formatted currency. |
| `percent` | `decimals = 0`, `locale = 'tr-TR'` | Percent (`0.42` → `42%`). |
| `date`, `time`, `datetime` | `locale = 'tr-TR'` | Locale date/time. |
| `iso` | — | ISO 8601 date string. |
| `abs`, `round`, `floor`, `ceil` | — | Numeric helpers. |

Register your own with `engine.registerFilter(name, fn)`; unknown filters return
the value unchanged.

---

## Template runtime reference

Every template can use the following, in addition to the locals passed to the
render call.

| Name | Description |
| --- | --- |
| `getvar(key?)`, `postvar(key?)` | Raw request values; no argument returns all values. |
| `setglobal`, `getglobal`, `hasglobal`, `deleteglobal` | Global store. |
| `escape(value)` | HTML-escapes `& < > " '`. |
| `filter(value, name, ...args)` | Applies a registered filter. |
| `write(value)` | Appends raw output (normally not needed). |
| `include(name, data?)` | Renders a partial (extension optional). |
| `importFile(name, data?)` | Renders a file with inherited locals; also used by `{@include}`. |
| `read(path, encoding?)` | Reads a file inside `rootPath` (relative to the template). |
| `exists(path)` | Checks a file inside `rootPath`. |
| `list(path?)` | Lists a directory inside `rootPath`. |
| `require(module)` | Requires a module; relative paths are confined to `rootPath`. |
| `fetch`, `fetchJson(url, options?)`, `fetchText(url, options?)` | HTTP helpers (Node 18+). |
| `get(url, options?)`, `post(url, body)`, `put(url, body)`, `patch(url, body)`, `del(url)` | JSON request helpers; `get`/`post` are the most used. |
| `range(start, end)`, `sleep(ms)` | Small utilities. |
| `join`, `resolve`, `basename`, `dirname`, `extname`, `relative` | Path helpers; `join`/`resolve` refuse to leave `rootPath`. |
| `__filename`, `__dirname`, `__dir`, `__file`, `cwd()` | Current template location and working directory. |
| `process` | `{ cwd, version, platform, env }`. |
| `console` | `log` / `warn` / `error`, printed only when `debug` is enabled. |
| `Buffer`, `setTimeout`, `setInterval`, `clearTimeout`, `clearInterval`, `setImmediate`, `clearImmediate` | Node globals. |

Locals are spread last, so a local named `getvar` would shadow the built-in; pick
distinct names.

### Types

`EmbedView`, `defaultFilters` and `ViewEngine` are runtime exports. TypeScript
types are exported from the package root: `CompiledTemplate`, `EngineOptions`,
`FilterMap`, `ParseResult`, `PathUtils`, `PluginContext`, `ViewEngineHost`,
`ViewRenderFn`, `ViewRenderOptions` and `ViewEngineOptions`.

---

## Examples

The `Examples/` directory contains small programs rather than snippets:

| Example | What it is |
| --- | --- |
| `01-hello` | A single template rendered without any framework. |
| `02-guestbook` | A working guestbook served by `engine.handler()`: storage, search, escaping, zero request code. |
| `03-api-posts` | Fetches users and posts from JSONPlaceholder and renders them with filters. |
| `04-view-engine` | `ViewEngine` mounted on a minimal host, plus a real Express app. |
| `05-multi-extension` | `.emv` → `.html` → `.js` resolution order. |
| `06-dynamic-css-names` | The template turns CSS class names into render-time values. |

See `Examples/README.md` for the commands.

---

## License

MIT © Levent Inan
