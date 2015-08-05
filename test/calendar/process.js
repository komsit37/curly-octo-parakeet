var should = require('../test-lib/chai-should');
var cal = require('../../lib/calendar');
var ro = require('../../lib/request-options');
var u = require('underscore');

describe('Calendar:Process', function () {
    var d = new Date();
    var def = {
        month: d.getMonth() + 1,
        year: d.getFullYear(),
        count: ro.DEFAULT_CALENDAR_COUNT
    };
    it('defaultOptions: no options', function () {
        var opt = cal.defaultOptions();
        opt.should.be.like(def);
    });

    it('defaultOptions: count 1', function () {
        var opt = cal.defaultOptions({count: 1});
        var c = u.clone(def);
        c.count = 1;
        opt.should.be.like(c);
    });

    it('defaultOptions: month 1', function () {
        var opt = cal.defaultOptions({month: 1});
        var c = u.clone(def);
        c.month = 1;
        opt.should.be.like(c);
    });

    it('defaultOptions: year 2014', function () {
        var opt = cal.defaultOptions({year: 2014});
        var c = u.clone(def);
        c.year = 2014;
        opt.should.be.like(c);
    });

    it('defaultOptions: all', function () {
        var opt = cal.defaultOptions({month: 4, year: 2014, count: 3});
        var c = {month: 4, year: 2014, count: 3};
        opt.should.be.like(c);
    });
});