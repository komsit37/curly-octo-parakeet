//var bnb = require('./../lib/bnb');
var room = require('./../../lib/room');
var logger = require('./../../lib/logger');

//bnb.getRoom('x') //status error
//bnb.getRoom('3266216') //null
room.getRoom('3266217').then(logger.info);
room.getRoom('3266217').then(logger.info);
room.getRoom('3266217').then(logger.info);
room.getRoom('3266217').then(logger.info);
room.getRoom('3266217').then(logger.info);
room.getRoom('3266217').then(logger.info);
room.getRoom('3266217').then(logger.info);

//room.getRoom('3266217',
//    function(error, result){
//        logger.debug('promise', result)
//    });