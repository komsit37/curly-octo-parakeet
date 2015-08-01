var moment = require('moment');

var d = moment.utc().format("YYYY.MM.DD");
var INDEX = 'bnbtest-' + d;
var TYPE = {
    STATUS: 'status',
    SEARCH: 'search',
    ROOM: 'room',
    CALENDAR: 'calendar'
};
var EVENT = {
    QUEUED: 'QUEUED',
    COMPLETED: 'COMPLETED',
    ERROR: 'ERROR'
};

module.exports.INDEX = INDEX;
module.exports.TYPE = TYPE;
module.exports.EVENT = EVENT;
module.exports.EVENT = EVENT;
