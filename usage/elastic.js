var logger = require('../lib/logger');
var bnb = require('./../lib/bnb');
var request = require('request-promise');
var elasticsearch = require('elasticsearch');

var elastic = new elasticsearch.Client({
    host: 'http://ea812885cdbbe17ca1b59edfd75631d7.us-east-1.aws.found.io:9200',
    log: 'trace'
});

//can be called in 2 flavours
//1. promise
bnb.search('Tokyo-Station--Tokyo--Japan', 8).then(function (result) {
    result.ids.forEach(function (id) {
        logger.info(id);
        bnb.getRoom(id)
            .then(function (room) {
                logger.info(room);
               //put into elasticsearch here
                elastic.index({
                    index: 'bnb',
                    type: 'room',
                    id: room.id,
                    body: room
                }, function(err, response){
                    if (err) logger.error(err);
                    logger.info('indexed', response);
                })
            }).catch(function (err) {
                logger.error(err);
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