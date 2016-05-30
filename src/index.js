'use strict';

const request = require("request");

class TorAddresses {
    constructor(options) {
        options = options || {};
        this.uri = "https://check.torproject.org/exit-addresses";
        this.adresses = [];
        this.timeInterval = options.timeInterval || 30 * 60 * 1000;
        this.start();
    }

    fetch() {
        request(this.uri, (err, res, body) => {
            if (!err && res.statusCode == 200)
                this.parse(body);
            else
                setTimeout(this.fetch.bind(this), 10 * 1000)
        })
    }

    parse(body) {

        const field = {
            name: 'ExitAddress',
            separator: ' ',
            position: 1
        };

        var bufferArray = body.split('\n'),
            adresses = [];

        bufferArray.forEach((row) => {
            var rowBuffer = row.split(field.separator);
            if (rowBuffer[0] == field.name)
                if (rowBuffer[field.position] && this.isIpAddress(rowBuffer[field.position]))
                    adresses.push(rowBuffer[field.position])
        });
        this.adresses = adresses;
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
            //console.warn('tor-ejector did not find TOR exit addresses');
            return -1
        }
    }

    isIpAddress(address) {
        const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
        return ipRegex.test(address);
    }
}

function torEjector(options) {
    var t = new TorAddresses(options);
    return function torEjector(req, res, next) {
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        if (t.indexOf(ip) >= 0)
            res.status(401).send(options.message || 'Unauthorized');
        else
            next()
    }
}

module.exports = torEjector;
