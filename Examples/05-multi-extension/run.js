const path = require('path');
const { EmbedView } = require('embedview');

async function main() {
    const options = { rootPath: __dirname };
    const render = name => EmbedView.renderFile(path.join(__dirname, 'views', name), { title: name }, options);

    // page.emv is absent → page.html is used
    console.log((await render('page')).trim());

    // widget.html and widget.emv are absent → widget.js is used
    console.log((await render('widget')).trim());

    // prefer.emv exists → it wins over prefer.html
    console.log((await render('prefer')).trim());
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
