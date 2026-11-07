const { EmbedView } = require('embedview');

async function main() {
    const html = await EmbedView.renderFile(
        'views/page.emv',
        {
            title: 'Embed View',
            items: ['Sequential', 'Async', 'Embedded']
        },
        { rootPath: __dirname }
    );

    console.log(html);
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
