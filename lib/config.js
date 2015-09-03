var secret;
try {
    secret = require('./../secret');
} catch(err){
    console.warn('secret.js not found. The app will not be able to connect to elasticsearch');
    secret = {};
}
var CONFIG = {
    RATE: {
        SEARCH: 5000,
        ROOM: 1,
        CALENDAR: 1,
        GEO: 2,
        PER: 15000
    },
    ELASTIC: {
        HOST: secret.ELASTICSEARCH_HOST,
        LOG_LEVEL: 'info'
    },
    LOG_LEVEL: 'debug',
    "ENV": "DEV"
};

module.exports = CONFIG;