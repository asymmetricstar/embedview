const { EmbedView } = require("embedview");

async function main() {
  const html = await EmbedView.renderFile(
    "views/index.html",
    {
      title: "Dynamic CSS Names",
      secret: Math.floor(Math.random() * 901) + 100,
    },
    { rootPath: __dirname },
  );

  console.log(html);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
