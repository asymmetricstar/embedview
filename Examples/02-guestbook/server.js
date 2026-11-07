const http = require('http');
const path = require('path');
const { EmbedView } = require('embedview');

const views = path.join(__dirname, 'views');
const engine = new EmbedView({ rootPath: views });

// GET/POST değerleri otomatik çözülür; ek request kodu gerekmez.
const server = http.createServer(engine.handler('index.emv'));

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Guestbook running at http://localhost:${port}`);
});
