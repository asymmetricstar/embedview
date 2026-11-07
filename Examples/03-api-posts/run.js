const { EmbedView } = require('embedview');

async function main() {
    const html = await EmbedView.renderFile(
        'views/posts.emv',
        {},
        { rootPath: __dirname }
    );

    console.log(html);
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
