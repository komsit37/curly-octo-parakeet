var rp = require('request-promise');
var ro = require('./request-options');
var CONFIG = require('config');
var u = require('underscore');
var limit = require("simple-rate-limiter");
var Promise = require("bluebird");
var logger = require('./logger');
var moment = require('moment');

var getCalendar = Promise.promisify(limit(function (id, options, cb) {
    if (!cb) cb = options;  //if no option is passed, promisify will call the method with cb on 2nd argument, so need to shift the argument
    if (!id) {
        cb(new Error('id is undefined'));
        return;
    }
    var optionDefault = defaultOptions(options);
    var url = 'http://' + ro.getBnbUrl() + '/api/v2/calendar_months';
    var proxy = ro.getProxies();
    var user_agent = ro.getUserAgent();
    var referer = 'https://www.airbnb.com/rooms/' + id + '?checkin=' + moment().add(2, 'days').format('MM%2FDD%2FYYYY') + '&checkout=' + moment().add(4, 'days').format('MM%2FDD%2FYYYY');
    logger.debug('requesting', url, 'through', proxy);
    rp({
        uri: url,
        proxy: proxy,
        jar: true,//use cookie so we don't get blocked so easily
        qs: {
            listing_id: id,
            month: optionDefault.month,
            year: optionDefault.year,
            count: optionDefault.count,
            key: ro.BNB_API_KEY,
            locale: 'en',
            currency: 'USD',
            _format: 'with_conditions'
        },
        headers: {
            'User-Agent': user_agent,
            'Referer': referer
            },
        resolveWithFullResponse: true   //because we need to query string to get listing_id
    }, function (error, response, body) {
        logger.debug('request.href', this.href);
        if (error) {
            cb(error);
        } else if (response.statusCode != 200){
            cb(new Error(response.statusCode));
        } else{
            var cal = process(response);
            cb(null, cal);
        }
    })
}).to(CONFIG.RATE.CALENDAR).per(CONFIG.RATE.PER).withFuzz([percent=0.5]));

function defaultOptions(options) {
    var d = new Date();
    return {
        month: (options && options.month) || (d.getMonth() + 1),
        year: (options && options.year) || d.getFullYear(),
        count: (options && options.count) || ro.DEFAULT_CALENDAR_COUNT
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

//www.airbnb.com/api/v2/calendar_months?key=d306zoyjsyarp7ifhu67rjxn52tv0t20&currency=JPY&locale=en&listing_id=3266217&month=7&year=2015&count=3&_format=with_conditions