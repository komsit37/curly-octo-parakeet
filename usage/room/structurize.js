//var bnb = require('./../lib/bnb');
var room = require('./../../lib/room');
var logger = require('./../../lib/logger');
var u = require('underscore');

//bnb.getRoom('x') //status error
//bnb.getRoom('3266216') //null
//room.getRoom('3266217') //ok
room.getRoom('666830', {structurize: true}) //ok
    .then(function (i) {
        //var o = elastic.structurizeRoom(i);
        //console.log(o);
        console.log(i);
    })
    .catch(function (error) {
        logger.error(error.stack);
    });

//room.getRoom('3266217',
//    function(error, result){
//        logger.debug('promise', result)
//    });