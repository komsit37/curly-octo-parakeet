var logger = require('../../lib/logger');
var bnb = require('./../../lib/search');

//can be called in 2 flavours
//1. promise
//bnb.search('Tokyo-Station--Tokyo--Japan', 6).then(function(result){
//   logger.info(result);
//});

bnb.searchAll('Chiang-Rai-Thailand').then(function(result){
   result.forEach(logger.info);
});

//2. callback
//bnb.search('Chiang-Rai-Thailand', 5, function (error, ids) {
//    if (error) {
//        logger.error(error);
//    }
//    else {
//        logger.info(ids);
//    }
//});