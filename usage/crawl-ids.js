var logger = require('../lib/logger');
var bnb = require('./../lib/bnb');
var request = require('request-promise');
var elasticsearch = require('elasticsearch');
var moment = require('moment');

var elastic = new elasticsearch.Client({
    host: 'http://gabviz:gabviz@elastic.ypricing.com',
    log: 'info'
});

var d = moment.utc().format("YYYY.MM.DD");
var INDEX = 'bnbtest-' + d;
var TYPE = {
    STATUS: 'status',
    SEARCH: 'search',
    ROOM: 'room',
    CALENDAR: 'calendar'
};

var justLog = function (err, response) {
    if (err) logger.error(err);
    logger.debug('indexed', response);
};

function elLog(id, type, event, msg, time) {
    var logObj = {id: id, timestamp: new Date(), type: type, event: event, message: msg, time: time};
    elastic.index({index: INDEX, type: TYPE.STATUS, id: id, body: logObj});
}

bnb.search('Tokyo--Japan', 5).then(function (result) {

    elastic.index({index: INDEX, type: TYPE.SEARCH, id: result.term + '-' + result.guests, body: result}, justLog);

});