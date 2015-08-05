
var USER_AGENT = [];
USER_AGENT.push('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.125 Safari/537.36');
//USER_AGENT.push('Mozilla/5.0');
//USER_AGENT.push('Opera/9.80 (X11; Linux i686; Ubuntu/14.10) Presto/2.12.388 Version/12.16');
//USER_AGENT.push('Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; AS; rv:11.0) like Gecko');
var i_agent = 0;
function getUserAgent(){
    return USER_AGENT[(i_agent++) % USER_AGENT.length];
}
//const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.81 Safari/537.36';
//const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.125 Safari/537.36';
//const USER_AGENT = '"Mozilla/5.0"';
//const USER_AGENT = 'Chrome 15.0.874';

//const BNB_URL = ['www.airbnb.com', 'www.airbnb.jp', 'www.airbnb.com.sg', 'www.airbnb.fr', 'www.airbnb.ru', 'www.airbnb.es'];
const BNB_URL = ['www.airbnb.com'];
var i_url = 0;
function getBnbUrl(){
    return BNB_URL[(i_url++) % BNB_URL.length];
}

//const PROXIES = ['', 'http://ypricing:gabviz@ypricing.com:3128'];
const PROXIES = [''];
var i_proxies = 0;
function getProxies(){
    return PROXIES[(i_proxies++) % PROXIES.length];
}

var BNB_API_KEY = 'd306zoyjsyarp7ifhu67rjxn52tv0t20';
var DEFAULT_CALENDAR_COUNT = 7;

module.exports.BNB_URL = BNB_URL;
module.exports.getBnbUrl = getBnbUrl;

module.exports.USER_AGENT = USER_AGENT;
module.exports.getUserAgent = getUserAgent;

module.exports.PROXIES = PROXIES;
module.exports.getProxies = getProxies;

module.exports.BNB_API_KEY = BNB_API_KEY;
module.exports.DEFAULT_CALENDAR_COUNT = DEFAULT_CALENDAR_COUNT;
