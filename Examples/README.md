# embedview Examples

Small, working programs built with **embedview**. Every example is
self-contained: the only dependency is the package itself.


## Programs

### 01-hello — one file, one render

```bash
node 01-hello/render.js
```

The smallest possible use: `EmbedView.renderFile()` renders a template with
data. No server, no adapter.

### 02-guestbook — a complete web app with zero request code

```bash
node 02-guestbook/server.js
# http://localhost:3000
```

```js
const engine = new EmbedView({ rootPath: views });
http.createServer(engine.handler('index.emv')).listen(3000);
```

That is the whole server. The handler puts every request in its own async scope,
so the template reads GET and POST values directly:

```html
<p>Search: $getvar("q")</p>
<p>Email: $postvar("email")</p>
```

The program — storing entries, searching, escaping output — lives inside
`views/index.emv`. Entries are kept with `setglobal("guestbook", [...])` and
read back with `getglobal("guestbook")`.

### 03-api-posts — real data, real filters

```bash
node 03-api-posts/run.js
```

Fetches users and posts from `https://jsonplaceholder.typicode.com` inside the
template (no API key, no setup) and renders them:

```html
<?js
const users = await get("https://jsonplaceholder.typicode.com/users");
const posts = await get("https://jsonplaceholder.typicode.com/posts?_limit=12");
?>
```

It demonstrates `get()`, caching through `setglobal` / `getglobal`, and the
filters `length`, `where`, `capitalize`, `uppercase`, `truncate` and `nl2br`.
Requires network access.

### 04-view-engine — mount on any view-engine host

```bash
node 04-view-engine/host.js
```

`host.js` implements the minimal `engine` + `set` + `get` host contract and
mounts `ViewEngine`. `app.render('index', ...)` finds `views/index.html` even
though no extension was given.

`express-app.example.js` is the same view mounted on Express (`npm i express`).
`ViewEngine.mount()` installs the request scope itself, so the routes pass no
query or body — the template uses `$getvar("email")` / `$postvar("email")`.

### 06-dynamic-css-names — make CSS element names dynamic variables

```bash
node 06-dynamic-css-names/render.js
```

The template turns CSS class names into render-time values. `<?js>` blocks in
`views/index.html` run during rendering and produce names with `randCss(...)`
and `itemCss(...)` helpers:

```html
<?js
    /* render.js -> secret*/
    const randCss = (prefix) => `${prefix}_${secret}_secure`;
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Dynamic CSS Names</title>
    <style>
        .${randCss("bgcolor")} { background: black; color: white; }
        .${randCss("Sequential")} { color: #f9a825; }
        .${randCss("Async")} { color: #60a5fa; }
        .${randCss("Embedded")} { color: #34d399; }
        .${randCss("bgcolor")} .item { padding: 4px 8px; margin: 2px 0; }
        .${randCss("bgcolor")} .tag { color: #a78bfa; }
        :root {
            --text: currentColor;
            --badge-bg: #111827;
            --badge-fg: #fde68a;
        }
    </style>
</head>
<body class="${randCss("bgcolor")}">
    <h1>Dynamic CSS Names</h1>
    <p>Class names are formed at render time from data, and reused through CSS variables instead of copying static strings.</p>
    <ul class="${randCss("bgcolor")}">
        <li class="${randCss("Sequential")} ">Sequential</li>
        <li class="${randCss("Async")} ">Async</li>
        <li class="${randCss("Embedded")} ">Embedded</li>
    </ul>
    <p>Prefixes: <span class="tag">${randCss("bgcolor")}</span></p>
    <script>console.log("bgcolor:", document.querySelector("li:first-child").className);</script>
</body>
</html>
```

The `<?js>` blocks execute during rendering, so the class names produced by
`randCss(...)` and `itemCss(...)` change on every run. To avoid duplicating
static strings, repeated visual values are kept in CSS variables declared under
`:root`; for example `--badge-bg`, `--badge-fg` and `--text` cover the colors
and text color used by the classes.

Filtrelerin bu sablonda işlediğini:

```text
- `random(1, 100)` → 100’ün altına çarpılabilir rastgele tam sayı
- `randomBytes(16)` → 16 baytlık rastgele hex
- `uuid()` → 32 haneli rastgele başına-yield kimlik
- `md5("selam")` → dizeye MD5 hash
```

`<script>` içindeki `document.querySelector("li:first-child").className`,
tarayıcıda çalışırken kopyalanan sınıf isimlerini alır; bu sayede sabit
içeriklerin kopyalanması gerekmez ve liste öğelerinde anlık üretilen sınıf
isimleri kullanılabilir.

## Notes

- **Default extension** is `.emv`; `.html` and `.js` behave the same way.
- **Request values:** `$getvar("name")` / `$postvar("email")` print escaped
  output. In JavaScript use `getvar("name")` / `postvar("email")` for raw
  values; dotted keys work (`getvar("user.name")`).
- **Automatic request scope:** `engine.handler(file)` and a mounted
  `ViewEngine` establish it. `application/x-www-form-urlencoded` and
  `application/json` bodies are parsed by the package; multipart forms are not.
- **Globals:** `setglobal("key", value)` / `getglobal("key")` keep the value
  type and live for the whole process.
- **File access** is confined to `rootPath` (default `process.cwd()`).
- Examples use `require('embedview')`; without `npm link`, install the package
  into this folder with `npm install <path-to-embedview>`.
