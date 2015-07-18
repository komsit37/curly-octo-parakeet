var rp = require('request-promise');
var utils = require('../lib/utils');
var u = require('underscore');

var BNB_API_KEY = 'd306zoyjsyarp7ifhu67rjxn52tv0t20';
var DEFAULT_COUNT = 7;

function getCalendar(id, options) {
   var optionDefault = defaultOptions(options);
    return rp({
        uri: 'http://www.airbnb.com/api/v2/calendar_months',
        qs: {
            listing_id: id,
            month: optionDefault.month,
            year: optionDefault.year,
            count: optionDefault.count,
            key: BNB_API_KEY,
            locale: 'en',
            currency: 'USD'
        },
        headers: {'User-Agent': utils.USER_AGENT},
        resolveWithFullResponse: true   //because we need to query string to get listing_id
    })
        .then(process);
}

function defaultOptions(options){
    var d = new Date();
    return {
        month: (options && options.month) || (d.getMonth() + 1),
        year: (options && options.year) || d.getFullYear(),
        count: (options && options.count) || DEFAULT_COUNT
    }
}


function process(response) {
    var qs = response.request._rp_options.qs;
    var cal = {};
    cal.timestamp = new Date();
    cal.id = qs.listing_id;
    cal = u.extend(cal, JSON.parse(response.body));
    return cal;
}

module.exports.getCalendar = getCalendar;
module.exports.defaultOptions = defaultOptions;
module.exports.process = process;
module.exports.DEFAULT_COUNT = DEFAULT_COUNT;

//www.airbnb.com/api/v2/calendar_months?key=d306zoyjsyarp7ifhu67rjxn52tv0t20&currency=JPY&locale=en&listing_id=3266217&month=7&year=2015&count=3&_format=with_conditions