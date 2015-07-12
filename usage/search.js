var logger = require('./../lib/logger');
var rp = require('request-promise');
var cheerio = require('cheerio');

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.81 Safari/537.36';
var rpdefault = rp.defaults({
    headers: {'User-Agent': USER_AGENT},
    baseUrl: 'https://www.airbnb.com/s/'
});


//https://www.airbnb.com/s/Tokyo-Station--Tokyo--Japan?guests=3
rpdefault({url: 'Tokyo-Station--Tokyo--Japan', qs: { guests: 3}}) //ok
    .then(function (html) {
        //TypeError - id not listed
        //logger.info(html);
        this.$ = cheerio.load(html);
        var ids = this.$('.listing').map(function(i, e){return $(e).data('id')}).get();
        console.log(ids);
    })
    .catch(function (error) {
        logger.error(error.stack);
    });