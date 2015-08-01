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

var info = {};
function process(result) {
    //logger.info(result);
    //console.log(JSON.stringify(result));
    var ids = result.ids;
    ids.forEach(function (id, i) {
        info[id] = {
            no: i,
            id: id,
            status: E.STATUS.QUEUED,
            message: '',
            retry: 0
        };
        logInfo(info[id]);
        tryRoom(id);
    })
}

function logInfo(d){
    delete d.timestamp; //no need to log timestamp
    logger.info(d);
    d.timestamp = new Date();   //elasticsearch need timestamp
    client.index({index: E.INDEX, type: E.TYPE.STATUS, id: d.id, body: d});
}

function logError(d){
    delete d.timestamp; //no need to log timestamp
    logger.error(d);
    d.timestamp = new Date();   //elasticsearch need timestamp
    client.index({index: E.INDEX, type: E.TYPE.STATUS, id: d.id, body: d});
}

function tryRoom(id) {
    var d = info[id];
    bnb.getRoom(id, {structurize: true})
        .then(function (room) {
            //todo: index calendar properly
            //todo: limit request properly

            //put into elasticsearch here
            client.index({index: E.INDEX, type: E.TYPE.ROOM, id: room.id, body: room});

            d.status = E.STATUS.COMPLETED;
            d.message = '';
            logInfo(d);
        }).catch(function (err) {
            d.status = E.STATUS.ERROR;
            d.message = err.message;
            logError(d);

            if (d.retry < 3) {
                setTimeout(function () {
                    d.retry += 1;
                    d.status = E.STATUS.RETRYING;
                    logInfo(d);
                    tryRoom(id);
                }, 60000)

            }

        });
}
