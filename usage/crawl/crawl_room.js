var u = require('underscore');
var logger = require('../../lib/logger');
var bnb = require('../../lib/bnb');

var client = require('../../lib/elasticsearch');
var E = require('../../lib/elastic-bnb');

var USE_FILE_INPUT = false;
if (USE_FILE_INPUT) {
    var fs = require('fs');
    var json = JSON.parse(fs.readFileSync('../../test/search/sample_result_from_elastic.json', 'utf8'));
    process(json);
} else {
    client.get({index: E.INDEX, type: E.TYPE.SEARCH, id: 'Tokyo'}).then(function (response) {
        process(response._source);
    });
}

var queue = {
    queued: 0,
    requesting: 0,
    completed: 0,
    error: 0,
    retry: 0
};
var info = {};
function process(result) {
    //logger.info(result);
    //console.log(JSON.stringify(result));

    var ids = result.ids;
    ids.forEach(function (id, i) {
        client.exists({index: E.INDEX, type: E.TYPE.ROOM, id: id}).then(function (exists) {
            info[id] = {
                no: i,
                id: id,
                retry: 0
            };
            logProgress(id, E.STATUS.QUEUED, '');
            if (!exists) {
                tryRoom(id);
            } else{
                logProgress(id, E.STATUS.COMPLETED, 'already existed');
            }
        })
    })
}

function tryRoom(id) {

    bnb.getRoom(id, {structurize: true})
        .then(function (room) {
            //todo: index calendar properly
            //todo: limit request properly

            //put into elasticsearch here
            client.index({index: E.INDEX, type: E.TYPE.ROOM, id: room.id, body: room});

            logProgress(id, E.STATUS.COMPLETED, '');
        }).catch(function (err) {
            logProgress(id, E.STATUS.ERROR, err.message);
            if (queue.error > 5){
                logger.error('too many consecutive errors. maybe got blocked from airbnb. exiting...');
                process.exit();
            }

            if (info[id].retry < 3) {
                setTimeout(function () {
                    logProgress(id, E.STATUS.RETRYING);
                    tryRoom(id);
                }, 60000)

            }

        });
}


function logProgress(id, status, msg){
    var d = info[id];
    d.status = status;
    if (msg)
        d.message = msg;
    if (d.status === E.STATUS.RETRYING){
        d.retry += 1;
    }
    delete d.timestamp; //no need to log timestamp
    if (d.status === E.STATUS.ERROR)
        logger.error(d);
    else
        logger.info(d);

    var t = new Date();
    d.timestamp = t;   //elasticsearch need timestamp
    client.index({index: E.INDEX, type: E.TYPE.STATUS, id: d.id, body: d});

    //update queue
    switch (d.status){
        case E.STATUS.QUEUED:
            queue.queued++;
            break;
        case E.STATUS.COMPLETED:
            queue.completed++;
            queue.queued--;
            break;
        case E.STATUS.ERROR:
            queue.error++;
            queue.queued--;
            break;
        case E.STATUS.RETRYING:
            queue.retry++;
            break;
    }
    client.index({index: E.INDEX, type: E.TYPE.QUEUE, body: {timestamp: t, queue: queue}});
}