var should = require('../test-lib/chai-should');

var fs = require('fs');
var cheerio = require('cheerio');

var room = require('../../lib/room');


describe("Room:parser", function () {
    describe('module', function () {
        {
            it("can be required", function () {
                should.exist(room);
            });
            it('have expected functions', function () {
                //need to add new methods here
                room.process.should.be.a("function");
                room.parser.should.be.a("function");
            })
        }
    });

    describe('process', function () {
        it('should success', function () {
            var raw_html = fs.readFileSync('./test/room/test_case/01_success_raw.html', 'utf8');
            var result_json = JSON.parse(fs.readFileSync('./test/room/test_case/01_success_result.json', 'utf8'));
            var json = room.process(raw_html);
            json.timestamp = "dummy";
            json.should.be.like(result_json);
        });
        it('should return null if id not listed', function () {
            var raw_html = fs.readFileSync('./test/room/test_case/02_room_not_listed.html', 'utf8');
            should.not.exist(room.process(raw_html));
        });
    });

    describe('processEnrich', function () {
        it('should success (promise)', function (done) {
            var raw_html = fs.readFileSync('./test/room/test_case/01_success_raw.html', 'utf8');
            var result_json = JSON.parse(fs.readFileSync('./test/room/test_case/01_success_result_geo.json', 'utf8'));
            room.processEnrich(raw_html).then(function (json) {
                json.timestamp = "dummy"; //since we can't compare this
                json.should.be.like(result_json);
                done();
            })
        });
        it('should success (callback)', function (done) {
            var raw_html = fs.readFileSync('./test/room/test_case/01_success_raw.html', 'utf8');
            var result_json = JSON.parse(fs.readFileSync('./test/room/test_case/01_success_result_geo.json', 'utf8'));
            room.processEnrich(raw_html, function (err, json) {
                json.timestamp = "dummy"; //since we can't compare this
                should.not.exist(err);
                json.should.be.like(result_json);
                done();
            })
        });
    });

    describe('parser', function () {
            //@testCase filename in ./test/room/test_case/..., html is input, and expected result is in json
            //@funcName function name  to test in string
            function parserTest(testCase, funcName) {
                it(testCase + ": " + funcName, function () {
                    var raw_html, expected_json, parser;
                    raw_html = fs.readFileSync('./test/room/test_case/' + testCase + '.html', 'utf8');
                    expected_json = JSON.parse(fs.readFileSync('./test/room/test_case/' + testCase + '.json', 'utf8'));
                    parser = new room.parser(raw_html);
                    parser[funcName](cheerio(raw_html)).should.be.like(expected_json);
                });
            }

            parserTest('03_details_w_monthly_price', '_parseDetails');
            parserTest('04_head_no_review', '_parseHead');
            parserTest('05_listing_name_normal', '_parseListingName');
            parserTest('06_host_profile', '_parseHostProfile');
            parserTest('06b_host_profile', '_parseHostProfile');
        }
    );


    describe('parse helper', function () {
        it('formatKey', function () {
            room._formatKey('Property Type: ').should.equal('property_type');
            room._formatKey('Accommodates: ').should.equal('accommodates');
            room._formatKey('Bedrooms: ').should.equal('bedrooms');
            room._formatKey('Bathrooms: ').should.equal('bathrooms');
            room._formatKey('Beds: ').should.equal('beds');
            room._formatKey('Check In: ').should.equal('check_in');
            room._formatKey('Check Out: ').should.equal('check_out');
            room._formatKey('Extra people: ').should.equal('extra_people');
            room._formatKey('Cleaning Fee: ').should.equal('cleaning_fee');
            room._formatKey('Security Deposit: ').should.equal('security_deposit');
            room._formatKey('Cancellation: ').should.equal('cancellation');
        });
        it('countStars', function () {
            var el = cheerio('\
            <div class="foreground">\
                <i class="icon icon-beach icon-star"></i>\
                <i class="icon icon-beach icon-star"></i>\
                <i class="icon icon-beach icon-star"></i>\
                <i class="icon icon-beach icon-star"></i>\
                <i class="icon icon-beach icon-star"></i>\
            </div>\
            <div class="background">\
                <i class="icon icon-star icon-light-gray"></i>\
                <i class="icon icon-star icon-light-gray"></i>\
                <i class="icon icon-star icon-light-gray"></i>\
                <i class="icon icon-star icon-light-gray"></i>\
                <i class="icon icon-star icon-light-gray"></i>\
            </div>'
            );
            room._countStars(el).should.equal(5);

            el = cheerio('\
            <div class="foreground">\
                <i class="icon icon-beach icon-star"></i>\
                <i class="icon icon-beach icon-star"></i>\
                <i class="icon icon-beach icon-star"></i>\
                <i class="icon icon-beach icon-star"></i>\
                <i class="icon icon-beach icon-star-half"></i>\
            </div>\
            <div class="background">\
                <i class="icon icon-star icon-light-gray"></i>\
                <i class="icon icon-star icon-light-gray"></i>\
                <i class="icon icon-star icon-light-gray"></i>\
                <i class="icon icon-star icon-light-gray"></i>\
                <i class="icon icon-star icon-light-gray"></i>\
            </div>'
            );
            room._countStars(el).should.equal(4.5);
        });
        it('digits', function () {
            room._digits('Saved 46 times').should.equal(46);
            room._digits('No Reviews Yet').should.equal(0);
        });
        it('extraPeople', function () {
            room._readExtraPeople(undefined).should.be.like({extra_guest_fee: 0, extra_guest_after: 0});
            room._readExtraPeople('Extra people: $17 / night after the first guest').should.be.like({
                extra_guest_fee: 17,
                extra_guest_after: 1
            });
            room._readExtraPeople('Extra people: $20 / night after 3 guests').should.be.like({
                extra_guest_fee: 20,
                extra_guest_after: 3
            });
        });
    });
});