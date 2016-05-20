'use strict';

process.env.PORT = process.env.PORT || 3000;

const express = require('express');
const torEjector = require('..');

var app = express();

app.use(torEjector({
    timeInterval: 3 * 60 * 1000,
    message: 'Sorry no TOR here'
}));

app.get('*', function (req, res) {
    res.status(200).send('Hello World!');
});

app.listen(process.env.PORT || 3000, function () {
    console.log('Example app listening on port %s!', process.env.PORT);
});
