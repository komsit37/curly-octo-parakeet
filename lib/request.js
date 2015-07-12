var rp = require('request-promise');

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.81 Safari/537.36';
var rpdefault = rp.defaults({headers: {'User-Agent': USER_AGENT}});

module.exports = rpdefault;