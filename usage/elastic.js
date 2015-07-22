var logger = require('../lib/logger');
var bnb = require('./../lib/bnb');
var request = require('request-promise');
var elasticsearch = require('elasticsearch');
var moment = require('moment');
var el = require('./../lib/elastic');

ª
var elastic = new elasticsearch.Client({
    host: 'http://ea812885cdbbe17ca1b59edfd75631d7.us-east-1.aws.found.io:9200',
    log: 'info'
});

var d = moment().format("YYYY.MM.DD");
var justLog = function (err, response) {
    if (err) logger.error(err);
    logger.info('indexed', response);
};

//can be called in 2 flavours
//1. promise
bnb.search('Tokyo-Station--Tokyo--Japan', 8).then(function (result) {
    //todo: skip duplicated id
    elastic.index({index: 'bnb-' + d, type: 'search', id: result.term + '-' + result.guests, body: result}, justLog);
    result.ids.forEach(function (id, i) {
        logger.info(i, id);
        bnb.getRoom(id)
            .then(function (room) {
                //todo: add keyword - guest - rank
                var roomS = el.structurizeRoom(room);


                //put into elasticsearch here
                elastic.index({index: 'bnb-' + d, type: 'room', id: roomS.id, body: roomS}, justLog);
            }).catch(function (err) {
                logger.error('room', err);
            });
        bnb.getCalendar(id)
            .then(function (cal) {
                //logger.info(cal);
                //put into elasticsearch here
                elastic.index({index: 'bnb-' + d, type: 'calendar', id: cal.id, body: cal}, justLog);
            }).catch(function (err) {
                logger.error('calendar', err);
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