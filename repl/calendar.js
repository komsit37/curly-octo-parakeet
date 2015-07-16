var rp = require('/apps/bnb-lib/node_modules/request-promise');
var utils = require('/apps/bnb-lib/lib/utils');

var BNB_API_KEY = 'd306zoyjsyarp7ifhu67rjxn52tv0t20';
var cal;
rp({
    uri: 'http://www.airbnb.com/api/v2/calendar_months',
    qs: {
        listing_id: '3266217',
        month: 7,
        year: 2015,
        key: BNB_API_KEY,
        locale: 'en',
        currency: 'USD'},
    headers: {'User-Agent': utils.USER_AGENT}
}).then(processCal).catch(console.error);


function processCal(calendar){
	console.log(calendar);
    cal = JSON.parse(calendar);
}

console.dir(cal)
Object.keys(cal)
cal.calendar_months
//www.airbnb.com/api/v2/calendar_months?key=d306zoyjsyarp7ifhu67rjxn52tv0t20&currency=JPY&locale=en&listing_id=3266217&month=7&year=2015&count=3&_format=with_conditions