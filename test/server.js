'use strict'

process.env.PORT = process.env.PORT || 3000

const express = require('express');
const torEjector = require('..');

var app = express();

app.use(torEjector());

app.get('*', function (req, res) {
    res.send('Hello World!');
});

app.listen(process.env.PORT || 3000, function () {
    console.log('Example app listening on port %s!', process.env.PORT);
});
