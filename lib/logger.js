var path = require('path');
var winston = require('winston');
require('winston-logstash');
winston.emitErrs = true;

var CONFIG = require('./config');
var logFile = path.join(__dirname, '..', 'logs/log.log');
var logger = new winston.Logger({
    transports: [
        new winston.transports.File({
            level: 'debug',
            filename: logFile,
            handleExceptions: true,
            json: true,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: false
        }),
        new winston.transports.Console({
            level: CONFIG.LOG_LEVEL,
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

logger.debug('logging to file', logFile);

module.exports = logger;
module.exports.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
};
