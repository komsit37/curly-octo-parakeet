var should = require('./test-lib/chai-should');
var bnb = require('../lib/bnb');
var room = require('../lib/room');
var cheerio = require('cheerio');
var fs = require('fs');

describe('general API of bnb-lib', function () {
    it('search', function (done) {
        bnb.search('Tokyo-Station--Tokyo--Japan', 7).then(function (result) {
            console.log(JSON.stringify(result));
            result.term.should.equals('Tokyo-Station--Tokyo--Japan');
            result.guests.should.equals(7);
            result.ids.should.have.length.above(0);
            result.ids[0].should.match(/^\d+$/);
            done();
        });
    });

    it('getRoom', function (done) {
        bnb.getRoom('3266217').then(function (json) {
            console.log(JSON.stringify(json));
            should.exist(json);
            json.id.should.equals('3266217');
            json.host_id.should.equals('16320275');
            json.host_name.should.equals('Kan Gab Bob');
            room.requiredFields.forEach(function (key) {
                should.exist(json[key]);    //all required fields are present
            });
            done();
        });
    });

    it('parseRoom', function () {
        var raw_html = fs.readFileSync('./test/room/test_case/01_success_raw.html', 'utf8');
        var result_json = JSON.parse(fs.readFileSync('./test/room/test_case/01_success_result.json', 'utf8'));
        var $ = cheerio.load(raw_html);
        var res = bnb.parseRoom($)
        res.timestamp = 'dummy';
        res.should.be.like(result_json);
    });

    it('getCalendar', function (done) {
        var id = '3266217';
        bnb.getCalendar(id).then(function (cal) {
            cal.id.should.equals(id);
            cal.should.have.property('calendar_months');
            cal.calendar_months.should.be.instanceof(Array);
            done();
        });
    });
});