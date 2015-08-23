var logger = require('../lib/logger');
var bnb = require('./../lib/bnb');
var request = require('request-promise');
var elasticsearch = require('elasticsearch');
var moment = require('moment');
var fs = require('fs');
var CONFIG = require('config');

var elastic = new elasticsearch.Client({
    host: CONFIG.ELASTICSEARCH_HOST,
    log: 'debug'
});

//test inserting room json from testcase
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
    logger.info('indexed', response);
};

var room = JSON.parse(fs.readFileSync('../test/room/test_case/01_success_result_geo.json', 'utf8'));
room.timestamp = new Date();
var roomS = bnb.structurizeRoom(room);

console.log(JSON.stringify(roomS));
//put into elasticsearch here
//elastic.index({index: INDEX, type: TYPE.ROOM, id: roomS.id, body: roomS}, justLog);

//todo
//1. confirm nested object works in calendar
//2. confirm rate limit works