var logger = require('../lib/logger');
var bnb = require('./../lib/bnb');
var request = require('request-promise');
var elasticsearch = require('elasticsearch');
var moment = require('moment');
var el = require('./../lib/elastic');

var elastic = new elasticsearch.Client({
    host: 'http://ea812885cdbbe17ca1b59edfd75631d7.us-east-1.aws.found.io:9200',
    log: 'info'
});

var d = moment.utc().format("YYYY.MM.DD");
var justLog = function (err, response) {
    if (err) logger.error(err);
    logger.info('indexed', response);
};

//can be called in 2 flavours
//1. promise
var doneId = {};
function isProcessed(id){
    if (doneId[id] === true){
        return true;
    } else{
        doneId[id] = true;
        return false
    }
}

function elLog(id, event, msg){
    var logObj = {id: id, timestamp: new Date(), event: event, message: msg};
    elastic.index({index: 'bnb-' + d, type: 'status', body: logObj}, justLog);
}
bnb.search('Harajuku-Station--Tokyo--Japan', 2).then(function (result) {
    //todo: skip duplicated id
    elastic.index({index: 'bnb-' + d, type: 'search', id: result.term + '-' + result.guests, body: result}, justLog);
    result.ids.forEach(function (id, i) {


        if (isProcessed(id)){
            logger.warn(i, id, 'duplicated');
            elLog(id, 'duplicate', 'id is already processed');
        } else{
            logger.info(i, id, 'process');
            elLog(id, 'process', 'will process');
        }

        bnb.getRoom(id)
            .then(function (room) {
                //todo: add keyword - guest - rank
                var roomS = el.structurizeRoom(room);
                //put into elasticsearch here
                elastic.index({index: 'bnb-' + d, type: 'room', id: roomS.id, body: roomS}, justLog);
                elLog(id, 'room-complete', 'done');
            }).catch(function (err) {
                logger.error('room', err);
                elLog(id, 'room-error', 'fail to fetch room: ' + err);
            });
        bnb.getCalendar(id)
            .then(function (cal) {
                //logger.info(cal);
                //put into elasticsearch here
                elastic.index({index: 'bnb-' + d, type: 'calendar', id: cal.id, body: cal}, justLog);
                elLog(id, 'calendar-complete', 'done');
            }).catch(function (err) {
                logger.error('calendar', err);
                elLog(id, 'calendar-error', 'fail to fetch calendar: ' + err);
            })
    })
});

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