var logger = require('../../lib/logger');

//enable logstash and test
setTimeout(function(){
    logger.info('test');
}, 5000);
