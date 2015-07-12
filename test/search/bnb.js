var should = require('../test-lib/chai-should');
var request = require('../../lib/request');
var utils = require('../../lib/utils');
var cheerio = require('cheerio');

describe('Bnb Search web API Check', function () {
    it('single page result', function (done) {
        request({
            uri: 'https://www.airbnb.com/s/Tokyo-Station--Tokyo--Japan?guests=10',
            headers: {'User-Agent': utils.USER_AGENT}
        }, function (error, response, body) {
            should.not.exist(error);
            should.exist(body);

            var $ = cheerio.load(body);
            should.exist($);

            $('.search-results').should.have.length.above(0);

            var listings = $('.listing');
            listings.should.have.length.above(0);
            listings.each(function (i, e) {
                var id = $(e).data('id');
                id.should.match(/^\d+$/)
            });

            $('div.pagination li').should.have.length(0);

            done();
        });
    });

    it('multi page result', function (done) {
        request({
            uri: 'https://www.airbnb.com/s/Tokyo-Station--Tokyo--Japan?guests=6',
            headers: {'User-Agent': utils.USER_AGENT}
        }, function (error, response, body) {
            should.not.exist(error);
            should.exist(body);

            var $ = cheerio.load(body);
            should.exist($);

            $('.search-results').should.have.length.above(0);

            var listings = $('.listing');
            listings.should.have.length.above(0);
            listings.each(function (i, e) {
                var id = $(e).data('id');
                id.should.match(/^\d+$/)
            });

            var pages = $('div.pagination li');
            pages.should.have.length.above(0);
            var nextLink = pages.find('.next a').attr('href');
            should.exist(nextLink);
            nextLink.should.equals('/s/Tokyo-Station--Tokyo--Japan?page=2');
            done();
        });
    });
});


