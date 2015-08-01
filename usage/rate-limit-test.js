var logger = require('../lib/logger');
var request = require('request');
var Promise = require("bluebird");
var limit = require("simple-rate-limiter");

var http = require('http');

http.createServer(function (req, res) {
    logger.info('receive request');
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end();
}).listen(5000);

var getRoom = Promise.promisify(limit(function (cb) {
    request({
        uri: 'http://localhost:5000',
        proxy: 'http://localhost:9050'
    }, function (error, response, body) {
        if (error) {
            logger.error(error);
            cb(error);
            return;
        }
        if (response.statusCode == 200){
            logger.log(body);
            cb(null, body);
        } else{
            logger.error(response.statusCode);
            cb(new Error(response.statusCode));
        }
    });
}).to(1).per(1000));

for (var i = 1; i < 100; i++) {
    logger.debug('send request');
    getRoom(logger.info);
}