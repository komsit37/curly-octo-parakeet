var logger = require('../../lib/logger');
var Crawler = require("crawler");
var url = require('url');
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.81 Safari/537.36';

function bnbSearch(s, guests) {
    s = s.replace('/s/', '');   //remove /s/ if present (we will prepend to search term later)
    logger.info('Queuing:', s, '(max_guests:', guests + ')');
    return {uri: 'https://www.airbnb.com/s/' + s, qs: {guests: guests}};
}

var c = new Crawler({
    userAgent: USER_AGENT,
    maxConnections: 3,
    timeout: 5000,
    skipDuplicates: true,
    ids: [],    //result array

    callback: function (error, result, $) {
        if (error) {
            logger.error(error);
            return;
        }

        logger.info('Parsing search-results', result.uri);
        if ($('.search-results').length == 0) {
            logger.error('Not search-results page. ignored');
            return;
        }

        this.ids.push($('.listing').map(function (i, e) {
            return $(e).data('id')
        }).get()); //parse id into ids

        var pages = $('div.pagination li');
        if (pages.length > 0) {             //use sequential fetch by page because we need results in order
            var current = pages.filter('.active').text();
            var last = pages.not('.next').last().text();
            logger.info('Page', current, 'of', last);

            var next = pages.find('.next a').attr('href');
            if (next) {
                c.queue(bnbSearch(next, this.qs.guests));
            }
        } else {
            logger.info('Page 1 of 1');
        }
    },

    onDrain: function () {
        logger.info('Done search');
        logger.info('Result:', this.ids);
        process.exit();
    }
});

c.queue(bnbSearch('Tokyo-Station--Tokyo--Japan', 6));

