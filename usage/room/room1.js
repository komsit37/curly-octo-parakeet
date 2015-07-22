var room = require('./../../lib/room');
var request = require('./../../lib/request');
var logger = require('./../../lib/logger');

request('https://www.airbnb.com/rooms/3160954') //ok
//request('https://www.airbnb.com/rooms/6128894') //2 reviews - no stars
//request('https://www.airbnb.com/rooms/5761835') //no reviews
//request('https://www.airbnb.com/rooms/3266216') //TypeError - id not listed
//request('https://www.airbnb.com/rooms/326621x') //StatusCodeError - wrong id
//request('https://www.abcsfefij.com')            //RequestError - request error
    .then(function (html) {
        //TypeError - id not listed
        console.log(html);
        json = room.process(html);
        logger.debug(JSON.stringify(json));
        console.log(json);
    })
    .catch(function (error) {
        logger.error(error.stack);
    });