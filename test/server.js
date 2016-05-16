var express = require('express');
var app = express();
var torEjector = require('..');

app.use(torEjector());

app.get('*', function (req, res) {
    res.send('Hello World!');
});

app.listen(3000, "0.0.0.0", function () {
    console.log('Example app listening on port 3000!');
});