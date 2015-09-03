var logger = require('./logger');
var Crawler = require("crawler");
var Promise = require("bluebird");
var ro = require('./request-options.js');
var CONFIG = require('config.js');

function _concat(s, guests){return '[' + s + ',' + guests + ']';}

function _buildSearchQuery(url, s, guests) {
    s = s.replace('/s/', '');   //remove /s/ if present (we will prepend to search term later)
    return {uri: 'https://' + url + '/s/' + s, qs: {guests: guests}};
}

function _isSearchPage($) {return $('.search-results').length > 0}
function _parseIds($) {return $('.listing').map(function (i, e) {return $(e).data('id').toString()}).get()}

//update result with new ids, filter out duplicates, create id-ranking map
function _updateResults(results, new_ids){
    if (!results.ids){
        results.ids = [];
    }

    if (!results.ranking){
        results.ranking = {};
    }

    new_ids.forEach(function(id){
        var rank = results.ids.length + 1;

        if (results.ranking[id])
            return; //id already exist --> duplicate

        results.ids.push(id);
        results.ranking[id] = rank;
    })
}


function _parsePages($) {
    var ret = {};
    var pages = $('div.pagination li');
    if (pages.length > 0) {             //use sequential fetch by page because we need search ranking
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
        userAgent: ro.getUserAgent(),
        rateLimits: CONFIG.RATE.SEARCH,
        retryTimeout: 60000,
        timeout: 5000,
        skipDuplicates: true,
        bnb_url: ro.getBnbUrl(),
        results: {
            timestamp: new Date(),  //create timestamp here so the attribute appear on top
            term: s,
            guests: guests},    //result array

        callback: function (error, result, $) {
            if (error) {
                logger.error(_concat(s, guests), error);
                cb(error);
                return;
            }

            if (result.statusCode != 200){
                cb(new Error('result not OK. code: ' + result.statusCode + ', message: ' + result.statusMessage));
                return;
            }

            logger.debug(_concat(s, guests), 'parsing search-results', result.uri);
            if (_isSearchPage($)) {
                var new_ids = _parseIds($);
                _updateResults(this.results, new_ids);

                var pages = _parsePages($);
                logger.debug(_concat(s, guests), 'page', pages.current, 'of', pages.last);
                if (pages.nextLink) {
                    c.queue(_buildSearchQuery(this.bnb_url, pages.nextLink, guests));
                }
            } else{
                logger.error(_concat(s, guests), 'not a search-results page. ignored');
                cb(new Error('Not search-results page'));
            }
        },

        onDrain: function () {
            logger.debug(_concat(s, guests), 'done');
            this.results.timestamp = new Date();
            this.results.ids_length = this.results.ids.length;
            cb(null, this.results);
        }
    });

    c.queue(_buildSearchQuery(c.options.bnb_url, s, guests));
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
module.exports._updateResults = _updateResults;

