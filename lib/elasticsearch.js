var logger = require('./logger');
var CONFIG = require('./config');
var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
    host: CONFIG.ELASTIC_HOST,
    log: CONFIG.LOG_LEVEL
});

module.exports = client;

