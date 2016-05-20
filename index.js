'use strict';

var request = require("request");

class TorAddresses {
    constructor(options) {
        options = options || {};

        this.uri = "https://check.torproject.org/exit-addresses";
        this.adresses = [];
        this.field = {
            name: 'ExitAddress',
            separator: ' ',
            position: 1
        };
        this.timeInterval = options.timeInterval || 30 * 60 * 1000;

        this.start();
    }

    fetch() {
        request(this.uri, (err, res, body) => {
            this.parse(body)
        })
    }

    parse(body) {
        var bufferArray = body.split('\n');
        this.adresses = [];
        bufferArray.forEach((row) => {
            var rowBuffer = row.split(this.field.separator);
            if (rowBuffer[0] == this.field.name)
                this.adresses.push(rowBuffer[1])
        });
    }

    start() {
        if (this.intervalId)
            return;
        this.fetch();
        this.intervalId = setInterval(this.fetch.bind(this), this.timeInterval)
    }

    stop() {
        if (this.intervalId)
            clearInterval(this.intervalId);
        this.intervalId = null
    }

    indexOf(address) {
        if (this.adresses && this.adresses.length)
            return this.adresses.indexOf(address);
        else {
            console.warn('tor-ejector did not find TOR exit addresses');
            return -1
        }
    }
}


function torEjector(options) {
    var t = new TorAddresses(options);
    return function torEjector(req, res, next) {

        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress

        if (t.indexOf(ip) >= 0)
            res.status(401).send(options.message || 'Unauthorized');
        else
            next()
    }
}

module.exports = torEjector;
