var should = require('../test-lib/chai-should');
var bnb = require('../../lib/bnb');
var Promise = require('bluebird');
var utils = require('../../lib/utils');

describe('utils:url_rotations', function () {
    it('confirm all rooms are the same', function (done) {
        var promises = utils.BNB_URL.map(function(){return bnb.getRoom('3266217')});
        Promise.all(promises).then(function (res) {
            res.reduce(function (x, y) {
                if (x && y) {
                    x.timestamp = 'dummy';
                    y.timestamp = 'dummy';
                    x.should.be.like(y);
                }
            });
            done();
        })
    });

    it('confirm all calendars are the same', function (done) {
        var promises = utils.BNB_URL.map(function(){return bnb.getCalendar('3266217')});
        Promise.all(promises).then(function (res) {
            res.reduce(function (x, y) {
                if (x && y) {
                    x.timestamp = 'dummy';
                    y.timestamp = 'dummy';
                    x.should.be.like(y);
                }
            });
            done();
        })
    });
});