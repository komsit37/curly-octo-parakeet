var secret = require('./../secret');
var CONFIG = {
    RATE: {
        SEARCH: 5,
        ROOM: 1,
        CALENDAR: 1,
        GEO: 2,
        PER: 15000
    },
    ELASTIC: {
        HOST: secret.ELASTICSEARCH_HOST,
        LOG_LEVEL: 'info'
    },
    LOG_LEVEL: 'debug'
};

module.exports = CONFIG;