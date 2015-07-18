var should = require('../test-lib/chai-should');
var cal = require('../../lib/calendar');

describe('Calendar:Request', function () {
    it('no options', function (done) {
        var id = '3266217';
        cal.getCalendar(id).then(function (cal) {
            cal.id.should.equals(id);
            cal.should.have.property('calendar_months');
            cal.calendar_months.should.be.instanceof(Array);
            done();
        });
    });

    it('count 1', function (done) {
        var id = '3266217';
        cal.getCalendar(id, {count: 1}).then(function (cal) {
            console.log(cal);
            cal.id.should.equals(id);
            cal.should.have.property('calendar_months');
            cal.calendar_months.should.be.instanceof(Array);
            done();
        });
    });
});