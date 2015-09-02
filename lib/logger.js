var path = require('path');
var winston = require('winston');
winston.emitErrs = true;

var CONFIG = require('./config');

var logger;
if (CONFIG.ENV === 'DEV'){
    logger = new winston.Logger({
        transports: [
            new winston.transports.Console({
                level: CONFIG.LOG_LEVEL,
                handleExceptions: false,
                json: false,
                colorize: true,
                timestamp: true
            })
        ],
        exitOnError: false
    });
} else{
    var logFile = path.join(__dirname, '..', 'logs/log.log');
    logger = new winston.Logger({
        transports: [
            new winston.transports.File({
                level: CONFIG.LOG_LEVEL,
                filename: logFile,
                handleExceptions: true,
                json: false,
                maxsize: 5242880, //5MB
                maxFiles: 5,
                colorize: true
            })
        ],
        exitOnError: false
    });
    logger.debug('logging to file', logFile);
}

module.exports = logger;
module.exports.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
};
