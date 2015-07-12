var should = require('../test-lib/chai-should');
var bnb = require('../../lib/search');

describe('Search Request', function () {
    it('single page result', function (done) {
        bnb.search('Tokyo-Station--Tokyo--Japan', 7).then(function (result) {
            console.log(result.ids);
            result.ids.should.have.length.above(0);
            done();
        });
    });

    it('multi page result', function (done) {
        bnb.search('Chiang-Rai-Thailand', 5).then(function (result) {
            console.log(result.ids);
            result.ids.should.have.length.above(0);
            done();
        });
    });

    it('no result', function (done) {
        bnb.search('Tokyo-Station--Tokyo--Japan', 100).then(function (result) {
            should.exist(result);
            result.ids.should.have.length(0);
            done();
        });
    });

    it('callback version', function (done) {
        bnb.search('Tokyo-Station--Tokyo--Japan', 8, function (error, result) {
            should.not.exist(error);
            should.exist(result);
            result.ids.should.have.length.above(0);
            done();
        });
    });
});