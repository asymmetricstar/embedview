const path = require('path');
const { ViewEngine } = require('embedview');

/**
 * Express'in view engine sözleşmesinin en küçük hali:
 * engine(ext, fn) + set(key, value) + get(key) + render(name, options, cb).
 */
class MiniApp {
    constructor() {
        this.engines = {};
        this.settings = {};
    }

    engine(extension, fn) {
        this.engines[`.${extension}`] = fn;
        return this;
    }

    set(key, value) {
        this.settings[key] = value;
        return this;
    }

    get(key) {
        return this.settings[key];
    }

    render(name, options, callback) {
        const extension = path.extname(name) || `.${this.settings['view engine']}`;
        const file = path.isAbsolute(name) ? name : path.resolve(this.settings.views[0], name);
        const engine = this.engines[extension];

        if (!engine) return callback(new Error(`No view engine for "${extension}"`));
        return engine(file, options || {}, callback);
    }
}

const app = new MiniApp();

ViewEngine.mount(app, {
    views: path.join(__dirname, 'views'),
    debug: false,
    watch: false
});

app.render('index', { title: 'ViewEngine', names: ['emv', 'html', 'js'] }, (error, html) => {
    if (error) {
        console.error(error);
        process.exit(1);
    }
    console.log(html);
});
