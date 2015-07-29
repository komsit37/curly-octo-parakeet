var logger = require('./logger');
var Crawler = require("crawler");
var Promise = require("bluebird");
var utils = require('./utils.js');
var CONFIG = require('./config.js');

function _cc(s, guests){return '[' + s + ',' + guests + ']';}

function _buildSearchQuery(s, guests) {
    s = s.replace('/s/', '');   //remove /s/ if present (we will prepend to search term later)
    return {uri: 'https://www.airbnb.com/s/' + s, qs: {guests: guests}};
}

function _isSearchPage($) {return $('.search-results').length > 0}
function _parseIds($) {return $('.listing').map(function (i, e) {return $(e).data('id').toString()}).get()}
function _parsePages($) {
    var ret = {};
    var pages = $('div.pagination li');
    if (pages.length > 0) {             //use sequential fetch by page because we need results in order
        ret.current = pages.filter('.active').text();
        ret.last = pages.not('.next').last().text();
        ret.nextLink = pages.find('.next a').attr('href');
    } else{
        ret.current = 1;
        ret.last = 1;
    }
    return ret;
}

var search = Promise.promisify(function(s, guests, cb) {
    var c = new Crawler({
        userAgent: utils.USER_AGENT,
        maxConnections: CONFIG.RATE.SEARCH,
        timeout: 5000,
        skipDuplicates: true,
        ids: [],    //result array

        callback: function (error, result, $) {
            if (error) {
                logger.error(_cc(s, guests), error);
                cb(error);
                return;
            }

            logger.debug(_cc(s, guests), 'parsing search-results', result.uri);
            if (_isSearchPage($)) {
                this.ids = Array.prototype.push.apply(this.ids, _parseIds($)); //parse id into ids

                var pages = _parsePages($);
                logger.debug(_cc(s, guests), 'page', pages.current, 'of', pages.last);
                if (pages.nextLink) {
                    c.queue(_buildSearchQuery(pages.nextLink, guests));
                }
            } else{
                logger.error(_cc(s, guests), 'not a search-results page. ignored');
                cb(new Error('Not search-results page'));
            }
        },

        onDrain: function () {
            logger.debug(_cc(s, guests), 'done');
            cb(null, {timestamp: new Date(), term: s, guests: guests, ids: this.ids});
        }
    });

    c.queue(_buildSearchQuery(s, guests));
});

function searchAll (s, cb){
    return Promise.all([
        search(s, 2),
        search(s, 4),
        search(s, 6),
        search(s, 8)
    ]).nodeify(cb);
}

module.exports.search = search;
module.exports.searchAll = searchAll;

