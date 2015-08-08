var should = require('../test-lib/chai-should');
var request = require('../test-lib/request');
var room = require('../../lib/room');

describe('Room Request', function () {
    it('invalid id should return StatusCodeError', function (done) {
        request('https://www.airbnb.com/rooms/326621x')
            .catch(function (error) {
                error.name.should.equals('StatusCodeError');
                done();
            });
    });

    //no need - just want to know what the return is
    //it('invalid domain should return RequestError', function (done) {
    //    request('https://www.airbnbxxx.com/rooms/326621x')
    //        .catch(function (error) {
    //            error.name.should.equals('RequestError');
    //            done();
    //        });
    //});

    it('room not listed', function (done) {
        request('https://www.airbnb.com/rooms/111111')//this room id does not exist, returning search page
            .then(function (h) {
                should.exist(h);
                should.not.exist(room.process(h));
                done();
            })
    });

    //same as room_bnb_test.js
    //it('room ok', function (done) {
    //    request('https://www.airbnb.com/rooms/3266217')
    //        .then(function (h) {
    //            should.exist(h);
    //            should.exist(room.process(h));
    //            done();
    //        })
    //});
    //
    //it('structurize ok', function (done) {
    //    room.getRoom('3266217', {strucurize: true})
    //        .then(function (json) {
    //            should.exist(json);
    //            console.log(json);
    //            done();
    //        })
    //});
});