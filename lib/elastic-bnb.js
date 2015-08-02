var moment = require('moment');

var d = moment.utc().format("YYYY.MM.DD");
var INDEX = 'bnbtest-' + d;
var TYPE = {
    STATUS: 'status',
    QUEUE: 'queue',
    SEARCH: 'search',
    ROOM: 'room',
    CALENDAR: 'calendar',
    RANKING: 'ranking'
};
var STATUS = {
    QUEUED: 'QUEUED',
    REQUESTING: 'REQUESTING',
    RETRYING: 'RETRYING',
    COMPLETED: 'COMPLETED',
    ERROR: 'ERROR'
};

module.exports.INDEX = INDEX;
module.exports.TYPE = TYPE;
module.exports.STATUS = STATUS;
