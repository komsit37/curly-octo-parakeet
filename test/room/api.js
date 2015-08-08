var should = require('../test-lib/chai-should');

var request = require('../test-lib/request');
var room = require('../../lib/room');

//use room_api_check.js instead
//describe('Room API', function () {
//    var test_case = [
//        {name: 'formatKey error', id: '3160954'},
//        {name: 'normal', id: '3266217'},
//        {name: 'no review', id: '5761835'},
//        {name: 'normal', id: '4158887'}
//    ];
//
//    test_case.forEach(function (test, i) {
//        var name = i + '-' + test.name + '-' + test.id;
//
//        describe(name, function () {
//            var json;
//            it('request ok', function (done) {
//                request('https://www.airbnb.com/rooms/' + test.id)
//                    .then(function (h) {
//                        should.exist(h);
//                        //logger.debug(h);
//                        json = room.process(h);
//                        console.log(json);
//                        done();
//                    })
//            });
//
//            room.requiredFields.forEach(function (key) {
//                it(key, function () {
//                    console.log(json[key]);
//                    should.exist(json[key]);
//                })
//            });
//
//            //optional fields  - just logging, no assertion
//            room.optionalFields.forEach(function (key) {
//                it('[opt] ' + key, function () {
//                    console.log(json[key]);
//                    //should.exist(json[key]);
//                })
//            });
//        });
//    });
//
//});