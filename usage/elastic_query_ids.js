var logger = require('../lib/logger');
var bnb = require('./../lib/bnb');
var request = require('request-promise');
var elasticsearch = require('elasticsearch');
var CONFIG = require('config');

var elastic = new elasticsearch.Client({
    host: CONFIG.ELASTICSEARCH_HOST,
    log: 'debug'
});


if (false) {
    elastic.get({
        index: 'bnbtest-2015.07.30',
        type: 'search',
        id: 'Tokyo--Japan-2'
    }, function (error, response) {
        //console.log(response);
        console.log(response._source.ids.length);
    });
}

if (true) {
    elastic.search({
        index: 'bnbtest-2015.07.30',
        //q: '+_type:status -event:complete -event:duplicate',
        type: 'status',
        size: 0,
        body: {
            aggs: {
                error_ids: {
                    filter: {terms: {event: ['error', 'duplicate']}},
                    aggs: {
                        ids: {
                            terms: {field: 'id', size: 0}
                        }
                    }
                }
            }
        }
    }).then(function (response) {
        var ids = response.aggregations.error_ids.ids.buckets.map(function (e) {
            return e.key;
        });
        console.log(ids);
        console.log(ids.length);

    });
}