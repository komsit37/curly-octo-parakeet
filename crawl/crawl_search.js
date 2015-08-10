var u = require('underscore');
var logger = require('../lib/logger');
var bnb = require('../lib/bnb');

var client = require('../lib/elasticsearch');
var E = require('../lib/elastic-bnb');

var Promise = require('bluebird');

var keywords = [];
keywords.push('Tokyo--Japan');
keywords.push('Tokyo-Station--Tokyo--Japan');
keywords.push('Shinjuku-Station--Tokyo--Japan');
keywords.push('Ginza-Station--Tokyo--Japan');
keywords.push('Tsukiji-Station--Tokyo--Japan');
keywords.push('Shibuya-Station--Tokyo--Japan');
keywords.push('Roppongi-Station--Tokyo--Japan');
keywords.push('Asakusa-Station--Tokyo--Japan');
keywords.push('Ikebukuro-Station--Tokyo--Japan');
keywords.push('Shinagawa-Station--Tokyo--Japan');

logger.info('Indexing bnb-search to ', E.INDEX);
logger.info('Keywords:', keywords);

//to execute promise search in sequential
keywords.reduce(function (cur, next) {
    return cur.then(function () {
        return bnb.searchAll(next).then(process);
    });
}, Promise.resolve());


function process(result) {
    if (result instanceof Array) {
        result.forEach(_process);
    } else {
        _process(result);
    }
}

function _process(result) {
    //logger.info(result);
    //console.log(JSON.stringify(result));

    index_ranking(result);
    index_search(result);
    index_combined_search(result);
}

function index_ranking(result) {
    var type = E.TYPE.RANKING;
    //index ranking in a separate document
    var ranking = result.ranking;
    u.each(ranking, function (rank, id) {
        var search_id = result.term + '-' + result.guests;
        var body = {};
        body.timestamp = result.timestamp;
        body[search_id] = rank;

        //need to check if exist first or elasticsearch will error if update is called without existing document
        client.exists({index: E.INDEX, type: type, id: id}).then(function (exists) {
            if (exists === true) {
                //update existing doc
                client.update({index: E.INDEX, type: type, id: id, body: {doc: body}}, logger.debug);
            } else {
                //create new doc
                client.index({index: E.INDEX, type: type, id: id, body: body}, logger.debug);
            }
        });
    });
}

function index_search(result) {
    delete result.ranking;
    var search_id = result.term + '-' + result.guests;
    client.index({index: E.INDEX, type: E.TYPE.SEARCH, id: search_id, body: result}, logger.debug);
}

function index_combined_search(result) {
    var type = E.TYPE.SEARCH;
    var combinedTerm = getSecondLastItemFromSearchTerm(result.term);
    var body;
    //todo: now i realized, this needs to be sequentialize as well (or combined and do just one call), else update will replace each other
    //need to check if exist first or elasticsearch will error if update is called without existing document
    client.exists({index: E.INDEX, type: type, id: combinedTerm}).then(function (exists) {
        if (exists === true) {
            //update existing doc
            client.get({index: E.INDEX, type: E.TYPE.SEARCH, id: combinedTerm}).then(function (response) {
                var combined_ids = response._source.ids;
                result.ids.forEach(function (item) {
                    if (combined_ids.indexOf(item) < 0) {
                        combined_ids.push(item);  //only add if not exist
                    }
                });
                body = {
                    timestamp: result.timestamp,
                    ids: combined_ids,
                    ids_length: combined_ids.length
                };
                client.update({index: E.INDEX, type: type, id: combinedTerm, body: {doc: body}}, logger.debug);
            });

        } else {
            //create new doc
            body = {
                timestamp: result.timestamp,
                id: combinedTerm,
                term: combinedTerm,
                guests: 0,
                ids: result.ids,
                ids_length: result.ids.length
            };
            client.index({index: E.INDEX, type: type, id: combinedTerm, body: body}, logger.debug);
        }
    });
}

function getSecondLastItemFromSearchTerm(terms) {
    var ss = terms.split('--');
    return ss[Math.max(ss.length - 2, 0)]; //get second from last
}