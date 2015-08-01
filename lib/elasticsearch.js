var logger = require('./logger');
var CONFIG = require('./config');
var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
    host: CONFIG.ELASTIC.HOST,
    log: CONFIG.ELASTIC.LOG_LEVEL
});

module.exports = client;

