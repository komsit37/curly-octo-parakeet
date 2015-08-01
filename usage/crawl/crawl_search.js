var u = require('underscore');
var logger = require('../../lib/logger');
var bnb = require('../../lib/bnb');

var client = require('../../lib/elasticsearch');
var E = require('../../lib/elastic-bnb');

var USE_FILE_INPUT = false;
if (USE_FILE_INPUT) {
    var fs = require('fs');
    var json = JSON.parse(fs.readFileSync('../../test/search/sample_result.json', 'utf8'));
    process(json);
} else {
    bnb.search('Shinjuku-Station--Tokyo--Japan', 1).then(function (result) {
        process(result);
    });
}

function process(result) {
    //logger.info(result);
    //console.log(JSON.stringify(result));

    index_ranking(result);
    index_search(result);
    index_ids(result);
}

function index_ranking(result){
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

function index_search(result){
    delete result.ranking;
    var search_id = result.term + '-' + result.guests;
    client.index({index: E.INDEX, type: E.TYPE.SEARCH, id: search_id, body: result}, logger.debug);
}

function index_ids(result){
    var type = E.TYPE.SEARCH;
    var id = getSecondLastItemFromSearchTerm(result.term);
    var body;

    //need to check if exist first or elasticsearch will error if update is called without existing document
    client.exists({index: E.INDEX, type: type, id: id}).then(function (exists) {
        if (exists === true) {
            //update existing doc
            client.get({index: E.INDEX, type: E.TYPE.SEARCH, id: id}).then(function(response){
                var combined_ids = response._source.ids;
                result.ids.forEach(function(item){
                   if (combined_ids.indexOf(item) < 0){
                       combined_ids.push(item);  //only add if not exist
                   }
                });
                body = {
                    timestamp: result.timestamp,
                    ids: combined_ids
                };
                client.update({index: E.INDEX, type: type, id: id, body: {doc: body}}, logger.debug);
            });

        } else {
            //create new doc
            body = {
                timestamp: result.timestamp,
                term: id,
                guests: 0,
                ids: result.ids
            };
            client.index({index: E.INDEX, type: type, id: id, body: body}, logger.debug);
        }
    });
}

function getSecondLastItemFromSearchTerm(terms){
    var ss = terms.split('--');
    return ss[Math.max(ss.length - 2, 0)]; //get second from last
}