'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var request = require("request");

var TorAddresses = function () {
    function TorAddresses(options) {
        _classCallCheck(this, TorAddresses);

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

    _createClass(TorAddresses, [{
        key: "fetch",
        value: function fetch() {
            var _this = this;

            request(this.uri, function (err, res, body) {
                if (!err && res.statusCode == 200) _this.parse(body);else setTimeout(_this.fetch.bind(_this), 10 * 1000);
            });
        }
    }, {
        key: "parse",
        value: function parse(body) {
            var _this2 = this;

            var bufferArray = body.split('\n'),
                adresses = [];

            bufferArray.forEach(function (row) {
                var rowBuffer = row.split(_this2.field.separator);
                if (rowBuffer[0] == _this2.field.name) if (rowBuffer[1] && _this2.isIpAddress(rowBuffer[1])) adresses.push(rowBuffer[1]);
            });
            this.adresses = adresses;
        }
    }, {
        key: "start",
        value: function start() {
            if (this.intervalId) return;
            this.fetch();
            this.intervalId = setInterval(this.fetch.bind(this), this.timeInterval);
        }
    }, {
        key: "stop",
        value: function stop() {
            if (this.intervalId) clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }, {
        key: "indexOf",
        value: function indexOf(address) {
            if (this.adresses && this.adresses.length) return this.adresses.indexOf(address);else {
                console.warn('tor-ejector did not find TOR exit addresses');
                return -1;
            }
        }
    }, {
        key: "isIpAddress",
        value: function isIpAddress(address) {
            var ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
            return ipRegex.test(address);
        }
    }]);

    return TorAddresses;
}();

function torEjector(options) {
    var t = new TorAddresses(options);
    return function torEjector(req, res, next) {
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        if (t.indexOf(ip) >= 0) res.status(401).send(options.message || 'Unauthorized');else next();
    };
}

module.exports = torEjector;
