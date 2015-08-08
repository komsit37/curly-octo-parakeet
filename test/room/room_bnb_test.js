var should = require('../test-lib/chai-should');
var request = require('../test-lib/request');
var room = require('../../lib/room');

describe('Room:bnb', function () {
    it('flat ok', function (done) {
        room.getRoom('3266217')
            .then(function (json) {
                should.exist(json);
                //console.log(json);
                should.exist(json.region);
                done();
            })
    });

    it('flat if structurize is false', function (done) {
        room.getRoom('3266217', {structurize: false})
            .then(function (json) {
                should.exist(json);
                should.exist(json.region);
                done();
            })
    });

    it('structurize ok', function (done) {
        room.getRoom('3266217', {structurize: true})
            .then(function (json) {
                should.exist(json);
                //console.log(json);
                should.exist(json.prop);
                done();
            })
    });
});