var winston = require('winston');
require('winston-logstash');
winston.emitErrs = true;

var logger = new winston.Logger({
    transports: [
        //new winston.transports.File({
        //    level: 'info',
        //    filename: './logs/all-logs.log',
        //    handleExceptions: true,
        //    json: true,
        //    maxsize: 5242880, //5MB
        //    maxFiles: 5,
        //    colorize: false
        //}),
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: false,
            json: false,
            colorize: true,
            timestamp: true
        })
        //,
        //winston.add(winston.transports.Logstash, {
        //    port: 28777,
        //    node_name: 'imac',
        //    host: 'ypricing.com'
        //})
    ],
    exitOnError: false
});

module.exports = logger;
module.exports.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
};