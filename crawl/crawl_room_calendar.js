var logger = require('../lib/logger');
var bnb = require('../lib/bnb');

var client = require('../lib/elasticsearch');
var E = require('../lib/elastic-bnb');
var Promise = require('bluebird');

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
    ids.forEach(function(newId, i){logProgress(i, newId, E.STATUS.QUEUED, '')});
}
function finish() {
    logResult('completed');
    logger.debug('done');
}

function processNewId(newId, i) {
    var room = bnb.getRoom(newId, {structurize: true});
    var calendar = room.then(function(){return bnb.getCalendar(newId)});    //get calendar after room

    return Promise.all([room, calendar]).then(function () {
        //if (i===1) throw new Error('i===1');  //for testing - simulate failure
        logProgress(i, newId, E.STATUS.COMPLETED, '');

        //put into elasticsearch here
        client.index({index: E.INDEX, type: E.TYPE.ROOM, newId: newId, body: room.value()});
        client.index({index: E.INDEX, type: E.TYPE.CALENDAR, newId: newId, body: calendar.value()});
    }).catch(function (err) {
        logProgress(i, newId, E.STATUS.ERROR, err.message);

        logger.debug('queue error count', queue.current.error);
        if (queue.current.error > MAX_ERROR_QUIT) {
            logger.error('too many consecutive errors. our ip may got banned. exiting...');
            logResult('incompleted').then(process.exit(1));
        } else{
            if (statusInfo[newId].retry < MAX_RETRY) {
                logProgress(i, newId, E.STATUS.RETRYING);

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

//progress report
var queue = {
    start: new Date(),
    type: E.TYPE.ROOM + '-' + E.TYPE.CALENDAR,
    current:{
        queued: 0,
        completed: 0,
        error: 0,
        retry: 0
    },
    cumulative:{
        queued: 0,
        completed: 0,
        error: 0,
        retry: 0
    }
};

statusInfo = {};
function logProgress(i, id, status, msg) {
    if (!(id in statusInfo)){
        statusInfo[id] = {
            no: i,
            type: E.TYPE.ROOM + '-' + E.TYPE.CALENDAR,
            id: id,
            retry: 0
        };
    }
    var d = statusInfo[id];
    d.status = status;
    if (msg)
        d.message = msg;
    if (d.status === E.STATUS.RETRYING) {
        d.retry += 1;
    }
    delete d.timestamp; //no need to log timestamp
    if (d.status === E.STATUS.ERROR)
        logger.error(d);
    else
        logger.info(d);

    d.timestamp = new Date();   //elasticsearch need timestamp
    client.index({index: E.INDEX, type: E.TYPE.STATUS, id: d.id, body: d});

    //update queue
    switch (d.status) {
        case E.STATUS.QUEUED:
            queue.current.queued++;
            queue.cumulative.queued++;
            break;
        case E.STATUS.COMPLETED:
            queue.current.completed++;
            queue.current.queued--;
            queue.current.error = Math.max(0, queue.current.error-1);   //remove consecutive error if completed successfully
            queue.cumulative.completed++;
            break;
        case E.STATUS.ERROR:
            queue.current.error++;
            queue.current.queued--;
            queue.cumulative.error++;
            break;
        case E.STATUS.RETRYING:
            queue.current.retry++;
            queue.cumulative.retry++;
            queue.current.error = Math.max(0, queue.current.error-1);   //remove consecutive error for retry case, because it's from the same id
            break;
    }
    client.index({index: E.INDEX, type: E.TYPE.QUEUE, body: {timestamp: new Date(), queue: queue}});
}

function logResult(result) {
    if (!queue.result) {
        queue.result = result;

        queue.run_time = Math.floor(((new Date) - queue.start) / (1000 * 60));
        queue.speed = queue.cumulative.completed / queue.run_time;
        logger.info('result', queue);

        return client.index({
            index: E.INDEX,
            type: E.TYPE.QUEUE + '-final',
            body: {timestamp: new Date(), queue: queue}
        });
    }
}
