var rp = require('request-promise');
var utils = require('../../lib/utils');
var u = require('underscore');

var BNB_API_KEY = 'd306zoyjsyarp7ifhu67rjxn52tv0t20';
rp({
    uri: 'http://www.airbnb.com/api/v2/calendar_months',
    qs: {
        listing_id: '3266217',
        month: 7,
        year: 2015,
        count: 7,
        key: BNB_API_KEY,
        locale: 'en',
        currency: 'USD'},
    headers: {'User-Agent': utils.USER_AGENT},
    resolveWithFullResponse: true
})
    .then(process)
    .then(console.log)
    .catch(console.error);


function process(response){
    var qs = response.request._rp_options.qs;
    var cal = {};
    cal.timestamp = new Date();
    cal.listing_id = qs.listing_id;
    cal = u.extend(cal, JSON.parse(response.body));
    return cal;
}

//www.airbnb.com/api/v2/calendar_months?key=d306zoyjsyarp7ifhu67rjxn52tv0t20&currency=JPY&locale=en&listing_id=3266217&month=7&year=2015&count=3&_format=with_conditions