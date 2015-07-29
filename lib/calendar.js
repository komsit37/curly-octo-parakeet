var rp = require('request-promise');
var utils = require('./utils');
var CONFIG = require('./config');
var u = require('underscore');
var limit = require("simple-rate-limiter");
var Promise = require("bluebird");

var BNB_API_KEY = 'd306zoyjsyarp7ifhu67rjxn52tv0t20';
var DEFAULT_COUNT = 7;

var getCalendar = Promise.promisify(limit(function (id, options, cb) {
    if (!cb) cb = options;  //if no option is passed, promisify will call the method with cb on 2nd argument, so need to shift the argument
    var optionDefault = defaultOptions(options);
    rp({
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
    }, function (error, response, body) {
        if (error) {
            cb(error);
        } else if (response.statusCode != 200){
            cb(new Error(response.statusCode));
        } else{
            var cal = process(response);
            cb(null, cal);
        }
    })
}).to(CONFIG.RATE.CALENDAR).per(1000));

function defaultOptions(options) {
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
    cal.id = qs.listing_id.toString();
    cal = u.extend(cal, JSON.parse(response.body));
    return cal;
}

module.exports.getCalendar = getCalendar;
module.exports.defaultOptions = defaultOptions;
module.exports.process = process;
module.exports.DEFAULT_COUNT = DEFAULT_COUNT;

//www.airbnb.com/api/v2/calendar_months?key=d306zoyjsyarp7ifhu67rjxn52tv0t20&currency=JPY&locale=en&listing_id=3266217&month=7&year=2015&count=3&_format=with_conditions