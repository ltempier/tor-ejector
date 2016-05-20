# tor-ejector

Tor-ejector is an express middleware that reject request from tor.

## Demo

Test url [tor-ejector.herokuapp.com](https://tor-ejector.herokuapp.com/)

```bash
# create tor proxy with docker
docker run -d -p 5566:5566 --env tors=25 mattes/rotating-proxy


# test with ...
curl https://tor-ejector.herokuapp.com
curl --proxy 127.0.0.1:5566 https://tor-ejector.herokuapp.com

```

## Installation

```bash
npm install tor-ejector
```

## Usage

```js
var express = require('express');
var app = express();
var torEjector = require('tor-ejector');

app.use(torEjector());

```

## Options

Name                   | Default         | Description
   --------------------|-----------------|---------
   timeInterval        | 1800000 (30min) | time interval between each update of TOR addresses
   message | 'Unauthorized' | reply message at a request

## Example
```js
var express = require('express');
var app = express();
var torEjector = require('tor-ejector');

app.use(torEjector({
  timeInterval : 30*60*1000,
  message : 'Sorry no TOR here'
}));

app.get('*', function (req, res) {
    res.send('Hello World!');
});

app.listen(3000, "0.0.0.0", function () {
    console.log('Example app listening on port 3000!');
});
```
