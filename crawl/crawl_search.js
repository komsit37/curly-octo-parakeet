var u = require('underscore');
var logger = require('../lib/logger');
var bnb = require('../lib/bnb');

var client = require('../lib/elasticsearch');
var E = require('../lib/elastic-bnb');

var Promise = require('bluebird');

var CONFIG = require('config');
var BatchReporterEs = require('batch-reporter-es').BatchReporterEs;
var batch = new BatchReporterEs(CONFIG.ELASTICSEARCH_HOST, E.INDEX_STATUS, E.TYPE.SEARCH);

var keywordGroup = 'Tokyo';
var keywords = [];
keywords.push('Tokyo--Japan');
keywords.push('Tokyo-Station--Tokyo--Japan');
keywords.push('Shinjuku-Station--Tokyo--Japan');
keywords.push('Ginza-Station--Tokyo--Japan');
keywords.push('Tsukiji-Station--Tokyo--Japan');
keywords.push('Shibuya-Station--Tokyo--Japan');
keywords.push('Harajuku-Station--Tokyo--Japan');
keywords.push('Roppongi-Station--Tokyo--Japan');
keywords.push('Asakusa-Station--Tokyo--Japan');
keywords.push('Ikebukuro-Station--Tokyo--Japan');
keywords.push('Shinagawa-Station--Tokyo--Japan');

logger.info('Indexing bnb-search to ', E.INDEX);
logger.info('Keywords:', keywords);
u.each(keywords, function(k){batch.queued(k)});

function handleError(err){
    logger.error(err);
    batch.error('', err.message);
}

function handleSuccess(res){
    logger.debug(res);
}

//to execute promise search in sequential
keywords.reduce(function (cur, next) {
    return cur.then(function () {
        batch.processing(next);
        return bnb.searchAll(next).then(process);
    }).catch(handleError);
}, Promise.resolve());


function process(result) {
    if (result instanceof Array) {
        result.forEach(_process);
        index_combined_search();
    } else {
        _process(result);
    }
}

var combined_ids = {};
function _process(result) {
    //result.ids, result.ranking, result.ids_length
    //logger.info(result);
    //console.log(JSON.stringify(result));

    //index_ranking(result);
    index_search(result);
    result.ids.forEach(function(x){combined_ids[x] = true});    //combined ids for index combined result later
}

//disable - es doesn't work well with simultaneous update from search results
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
                client.update({index: E.INDEX, type: type, id: id, body: {doc: body}}).then(handleSuccess).catch(handleError);
            } else {
                //create new doc
                client.index({index: E.INDEX, type: type, id: id, body: body}).then(handleSuccess).catch(handleError);
            }
        }).catch(handleError);
    });
}

function index_search(result) {
    delete result.ranking;
    batch.completed(result.term);
    var search_id = result.term + '-' + result.guests;
    client.index({index: E.INDEX, type: E.TYPE.SEARCH, id: search_id, body: result}).then(handleSuccess).catch(handleError);
}

function index_combined_search() {
    var type = E.TYPE.SEARCH;
    var ids = u.keys(combined_ids);
    var body;
    //need to check if exist first or elasticsearch will error if update is called without existing document
    client.exists({index: E.INDEX, type: type, id: keywordGroup}).then(function (exists) {
        if (exists === true) {
            //update existing doc
            client.get({index: E.INDEX, type: E.TYPE.SEARCH, id: keywordGroup}).then(function (response) {
                var existing_ids = response._source.ids;
                ids.forEach(function (item) {
                    if (existing_ids.indexOf(item) < 0) {
                        existing_ids.push(item);  //only add if not exist
                    }
                });
                body = {
                    timestamp: new Date(),
                    ids: existing_ids,
                    ids_length: existing_ids.length
                };
                client.update({index: E.INDEX, type: type, id: keywordGroup, body: {doc: body}}).then(handleSuccess).catch(handleError);
            });

        } else {
            //create new doc
            body = {
                timestamp: new Date(),
                id: keywordGroup,
                term: keywordGroup,
                guests: 0,
                ids: ids,
                ids_length: ids.length
            };
            client.index({index: E.INDEX, type: type, id: keywordGroup, body: body}).then(handleSuccess).catch(handleError);
        }
    });
}

//function getSecondLastItemFromSearchTerm(terms) {
//    var ss = terms.split('--');
//    return ss[Math.max(ss.length - 2, 0)]; //get second from last
//}