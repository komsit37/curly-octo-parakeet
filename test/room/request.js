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

    it('invalid domain should return RequestError', function (done) {
        request('https://www.airbnbxxx.com/rooms/326621x')
            .catch(function (error) {
                error.name.should.equals('RequestError');
                done();
            });
    });

    it('room not listed', function (done) {
        request('https://www.airbnb.com/rooms/111111')//this room id does not exist, returning search page
            .then(function (h) {
                should.exist(h);
                should.not.exist(room.process(h));
                done();
            })
    });

    it('room ok', function (done) {
        request('https://www.airbnb.com/rooms/3266217')//this room id does not exist, returning search page
            .then(function (h) {
                should.exist(h);
                should.exist(room.process(h));
                done();
            })
    });
});