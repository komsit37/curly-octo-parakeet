var u = require('underscore');
var logger = require('../../lib/logger');
var bnb = require('../../lib/bnb');

var client = require('../../lib/elasticsearch');
var E = require('../../lib/elastic-bnb');

var Queue = require('../../lib/queue');
q = new Queue();

var USE_FILE_INPUT = false;
if (USE_FILE_INPUT) {
    var fs = require('fs');
    var json = JSON.parse(fs.readFileSync('../../test/search/sample_result_from_elastic.json', 'utf8'));
    processIds(json);
} else {
    client.get({index: E.INDEX, type: E.TYPE.SEARCH, id: 'Tokyo'}).then(function (response) {
        processIds(response._source);
    });
}

var queue = {
    start: new Date(),
    type: E.TYPE.CALENDAR,
    queued: 0,
    requesting: 0,
    completed: 0,
    error: 0,
    retry: 0,
    all_queued: 0,
    all_completed: 0,
    all_error: 0,
    all_retry: 0
};
var info = {};
function processIds(result) {
    //logger.info(result);
    //console.log(JSON.stringify(result));

    var ids = result.ids;
    ids.forEach(function (id, i) {

        client.exists({index: E.INDEX, type: E.TYPE.CALENDAR, id: id}).then(function (exists) {
            info[id] = {
                no: i,
                type: E.TYPE.CALENDAR,
                id: id,
                retry: 0
            };

            if (!exists) {
                //if (queue.all_queued > 10) return;   //for quick test
                logProgress(id, E.STATUS.QUEUED, '');
                q.enqueue(id);
                //tryRoom(id);
            } else {
                //logProgress(id, E.STATUS.COMPLETED, 'already existed');   //skip logging completed
            }
        })
    })
}
q.on('process', function (id) {
    //console.log(job);
    tryRoom(id);
    client.index({index: E.INDEX, type: E.TYPE.QUEUE, body: {timestamp: new Date(), queue: queue}});
});

function tryRoom(id) {

    bnb.getCalendar(id)
        .then(function (cal) {
            //todo: index calendar properly
            //todo: limit request properly

            //put into elasticsearch here
            client.index({index: E.INDEX, type: E.TYPE.CALENDAR, id: cal.id, body: cal});
            logProgress(id, E.STATUS.COMPLETED, '');
        }).catch(function (err) {
            logProgress(id, E.STATUS.ERROR, err.message);

            logger.debug('queue error count', queue.error);
            if (queue.error > 1) {
                logger.warn('got error, slow down for a while');
                q.changeInterval(q.backoff + 2);
                setTimeout(function () {
                    q.changeInterval(1);
                    //tryRoom(id);
                }, 60000)
            }

            if (queue.error > 3) {
                logger.error('too many consecutive errors. maybe got blocked from airbnb. exiting...');
                q.stop();
                logResult('incompleted');
                process.exit(1);
            }

            if (info[id].retry < 3) {
                logProgress(id, E.STATUS.RETRYING);
                q.enqueue(id);
                //tryRoom(id);
            }
        });
}

function logProgress(id, status, msg) {
    var d = info[id];
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
    client.index({index: E.INDEX, type: E.TYPE.STATUS, id: d.type + '-' + d.id, body: d});

    //update queue
    switch (d.status) {
        case E.STATUS.QUEUED:
            queue.queued++;
            queue.all_queued++;
            break;
        case E.STATUS.COMPLETED:
            queue.completed++;
            queue.queued--;
            queue.all_completed++;
            break;
        case E.STATUS.ERROR:
            queue.error++;
            queue.queued--;
            queue.all_error++;
            break;
        case E.STATUS.RETRYING:
            queue.retry++;
            queue.all_retry++;
            break;
    }
    logger.debug(queue.queued + ' jobs left');

    if (queue.queued === 0){
        logResult('completed');
    }
}

function logResult(result) {
    if (!queue.result) {
        queue.result = result;

        queue.run_time = Math.floor(((new Date) - queue.start) / (1000 * 60));
        queue.speed = queue.all_completed / queue.run_time;
        logger.info('result', queue);

        client.index({
            index: E.INDEX,
            type: E.TYPE.QUEUE + '-final',
            body: {timestamp: new Date(), queue: queue}
        }, process.exit);
    }
}

q.start();