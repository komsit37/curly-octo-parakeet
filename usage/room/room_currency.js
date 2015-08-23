//var bnb = require('./../lib/bnb');
var room = require('./../../lib/room');
var logger = require('./../../lib/logger');
var request = require('request');
var ro = require('./../../lib/request-options.js');


var url = 'http://' + ro.getBnbUrl() + '/users/change_currency';
var proxy = ro.getProxies();
var user_agent = ro.getUserAgent();
logger.debug('requesting', url, 'through', proxy);

request({
    uri: 'http://' + ro.getBnbUrl() + '/rooms/3266217',
    jar: true,//use cookie so we don't get blocked so easily
    headers: {
        'User-Agent': user_agent,
        Connection: 'keep-alive'
    },
    //qs: {locale: 'en'},
    proxy: proxy
}, function (error, response, body) {
    //var j = room.process(body);
    //console.log(j);


    request.post({
        uri: url,
        jar: true,//use cookie so we don't get blocked so easily
        headers: {
            'User-Agent': user_agent,
            Connection: 'keep-alive'
        },
        //qs: {locale: 'en'},
        proxy: proxy,
        form: {new_currency: 'JPY'}
    }, function (error, response, body) {
        console.log(body);
        request({
            uri: 'http://' + ro.getBnbUrl() + '/rooms/3266217',
            jar: true,//use cookie so we don't get blocked so easily
            headers: {
                'User-Agent': user_agent,
                Connection: 'keep-alive'
            },
            //qs: {locale: 'en'},
            proxy: proxy
        }, function (error, response, body) {
            var j = room.process(body);
            console.log(j);
        });
    });
});
//bnb.getRoom('x') //status error
//bnb.getRoom('3266216') //null


//room.getRoom('3266217',
//    function(error, result){
//        logger.debug('promise', result)
//    });