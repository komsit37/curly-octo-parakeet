var logger = require('../lib/logger');
var bnb = require('./../lib/bnb');
var request = require('request-promise');
var elasticsearch = require('elasticsearch');
var moment = require('moment');
var CONFIG = require('config');

var elastic = new elasticsearch.Client({
    host: CONFIG.ELASTICSEARCH_HOST,
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

//
//elastic.get({
//    index: 'bnbtest-2015.07.30',
//    type: 'search',
//    id: 'Tokyo--Japan-2'
//}, function (error, response) {
//    //console.log(response);
//    var ids = response._source.ids;
//    ids.forEach(function (id, i) {
//        tryRoom(id, i);
//    })
//});

var search_ids = elastic.search({
    index: 'bnbtest-2015.08.01',
    //q: '+_type:status -event:complete -event:duplicate',
    type: 'status',
    size: 0,
    body: {
        aggs: {
            error_ids: {
                filter: {terms: {event: ['error', 'duplicate']}},
                aggs: {
                    ids: {
                        terms: {field: 'id', size: 0}
                    }
                }
            }
        }
    }
}).then(function (response) {

    var ids = response.aggregations.error_ids.ids.buckets.map(function (e) {
        return e.key;
    });
    //console.log(ids);
    console.log(ids.length);
    return ids;
});

search_ids.then(function (ids) {
    ids.forEach(function (id, i) {
        tryRoom(id, i);
    })
});


var stats = {};
function tryRoom(id, i) {
    if (!stats[id]){
        stats[id] = {
            status: 'processing',
            startTime: new Date(),
            retry: 0
        };
    }

    if (stats[id].stats == 'completed') {
        logger.warn(i, id, 'duplicated');
        elLog(id, 'room', 'duplicated', 'id is already processed', 0);
    } else {
        logger.info(i, id, 'processing', stats[id].retry, 'tries');
        elLog(id, 'room', 'processing', 'will process', 0);

        bnb.getRoom(id)
            .then(function (room) {
                //todo: add keyword - guest - rank
                //todo: index calendar properly
                //todo: limit request properly

                stats[id].elapsedTime = new Date() - stats[id].startTime;
                stats[id].status = 'completed';
                //put into elasticsearch here
                elastic.index({index: INDEX, type: TYPE.ROOM, id: room.id, body: room}, justLog);
                elLog(id, 'room', 'completed', 'done', stats[id].elapsedTime);
                logger.info(i, 'completed ', id);
            }).catch(function (err) {
                stats[id].elapsedTime = new Date() - stats[id].startTime;
                logger.error('room', err);
                elLog(id, 'room', 'error', stats[id].retry + ' try. fail to fetch room: ' + err, stats[id].elapsedTime);

                if (stats[id].retry < 3) {
                    //setTimeout(function () {
                    stats[id].retry += 1;
                    logger.info(i, id, 'error. will retry. retry ' + stats[id].retry);
                    elLog(id, 'room', 'error', 'will retry', stats[id].retry);
                    tryRoom(id, i);
                    //}, 5000)

                }

            });
    }
//bnb.getCalendar(id)
//    .then(function (cal) {
//        //logger.info(cal);
//        //put into elasticsearch here
//        elastic.index({index: INDEX, type: TYPE.CALENDAR, id: cal.id, body: cal}, justLog);
//        elLog(id, 'calendar', 'complete', 'done', (new Date()) - startTime[id]);
//    }).catch(function (err) {
//        logger.error('calendar', err);
//        elLog(id, 'calendar', 'error', 'fail to fetch calendar: ' + err, (new Date()) - startTime[id]);
//    })
}

//bnb.searchAll('Chiang-Rai-Thailand').then(function(result){
//   result.forEach(function(el){
//      logger.info(el.ids);
//   });
//});

//2. callback
//bnb.search('Chiang-Rai-Thailand', 5, function (error, ids) {
//    if (error) {
//        logger.error(error);
//    }
//    else {
//        logger.info(ids);
//    }
//});