var should = require('../test-lib/chai-should');
var search = require('../../lib/search');

describe('Search:result_parsing', function () {
    it('ids are added correctly', function () {
        var res = {};
        var ids = ['123', '456'];
        search._updateResults(res, ids);
        res.ids.should.be.like(ids);
        res.ranking.should.be.like({'123': 1, '456': 2});
    });

    it('duplicates are filtered', function () {
        var res = {ids: []};
        var ids = ['123', '456'];
        search._updateResults(res, ids);

        search._updateResults(res, ['123', '789']);
        res.ids.should.be.like(['123', '456', '789']);
        res.ranking.should.be.like({'123': 1, '456': 2, '789': 3});
    });

});