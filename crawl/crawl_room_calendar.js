var logger = require('../lib/logger');
var bnb = require('../lib/bnb');
var CONFIG = require('config');
var elasticsearch = require('elasticsearch');

var E = require('../lib/elastic-bnb');
var Promise = require('bluebird');


var BatchReporterEs = require('batch-reporter-es').BatchReporterEs;
var batch = new BatchReporterEs(CONFIG.ELASTICSEARCH_HOST, E.INDEX_STATUS, 'room-calendar');

var client = new elasticsearch.Client({
    host: CONFIG.ELASTICSEARCH_HOST,
    log: CONFIG.ELASTICSEARCH_LOG,
    requestTimeout: 60000
});

function handleError(err){
    logger.error(err);
    batch.error('', err.message);
}

function handleSuccess(res){
    logger.debug(res);
}

/*
completely synchronous craw ... why am i using node??? this should be very simple using python
 */
var RETRY_SLEEP = 60000;
var MAX_RETRY = 3;
var MAX_ERROR_QUIT = 3;

var KEYWORD = 'Tokyo';
logger.info('Indexing room-calendar to ', E.INDEX);
logger.info('Keywords:', KEYWORD);

//client.get({index: E.INDEX, type: E.TYPE.SEARCH, id: 'Shinjuku-Station--Tokyo--Japan-2'}).then(function (response) {
client.get({index: E.INDEX, type: E.TYPE.SEARCH, id: KEYWORD}).then(function (response) {
    processIds(response._source.ids);
});

//synchronous execution - since we want to avoid getting banned, seems more complicated than it should be,  why am i using node here???
function processIds(ids) {
    client.mget({
        index: E.INDEX,
        type: E.TYPE.ROOM,
        body: {ids: ids},
        _source: false  //check if ids already exist
    })
        .then(extractNewIds)
        //.filter(function(_, i){return i < 10}) //for debugging small range
        .tap(beforeStart)
        .each(processNewId)
        .then(finish)
}

function beforeStart(ids) {
    logger.debug('getting', ids.length);
    //log all id that we are going to crawl first, so we can track progress more accurately in kibana
    ids.forEach(function(newId, i){batch.queued(newId)});
}
function finish() {
    batch.success();
    logger.debug('done');
}

function processNewId(newId, i) {
    var room = bnb.getRoom(newId, {structurize: true});
    var calendar = room.then(function(){return bnb.getCalendar(newId)});    //get calendar after room
    batch.processing(newId);
    return Promise.all([room, calendar]).then(function () {
        //if (i===1) throw new Error('i===1');  //for testing - simulate failure
        batch.completed(newId);

        //put into elasticsearch here
        client.index({index: E.INDEX, type: E.TYPE.ROOM, id: newId, body: room.value()}).then(handleSuccess).catch(handleError);;
        client.index({index: E.INDEX, type: E.TYPE.CALENDAR, id: newId, body: calendar.value()}).then(handleSuccess).catch(handleError);;
    }).catch(function (err) {
        batch.error(newId, err.message);

        logger.debug('queue error count', batch.getQueueStatus().current.error);
        if (batch.getQueueStatus().current.error > MAX_ERROR_QUIT) {
            logger.error('too many consecutive errors. our ip may got banned. exiting...');
            batch.fail().then(process.exit(1));
        } else{
            if (statusInfo[newId].retry < MAX_RETRY) {
                batch.retrying(newId);

                //return promise so that this will be called in the chain
                return Promise.delay(RETRY_SLEEP).then(function () {
                    logger.debug(i, newId, 'retrying', statusInfo[newId].retry, 'times');
                    return processNewId(newId, i);
                });
            } else{
                logger.warn(i, newId, 'exceed retry limits, giving up on this id');
            }
        }
    })
}


//helper
function extractNewIds(response) {
    return response.docs
        .filter(function (doc) {return !doc.found})
        .map(function (doc) {return doc._id})
}