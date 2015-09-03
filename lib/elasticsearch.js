var CONFIG = require('config');
var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
    host: CONFIG.ELASTICSEARCH_HOST,
    log: CONFIG.ELASTICSEARCH_LOG
});

module.exports = client;

