// Requires an Express installation: npm i express
const path = require('path');
const express = require('express');
const { ViewEngine } = require('embedview');

const app = express();

ViewEngine.mount(app, {
    views: path.join(__dirname, 'views')
});

// No query/body extraction: $getvar / $postvar read the active request.
function render(request, response) {
    response.render('index', {
        title: 'express + embedview',
        names: ['emv', 'html', 'js']
    });
}

app.get('/', render);
app.post('/', render);

app.listen(3000, () => {
    console.log('http://localhost:3000');
});
