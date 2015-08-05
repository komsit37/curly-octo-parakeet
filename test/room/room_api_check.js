var should = require('../test-lib/chai-should');
var request = require('../test-lib/request');
var ro = require('../../lib/request-options');
var cheerio = require('cheerio');

var room = require('../../lib/room');

describe('Bnb Room web API Check', function () {

    it('as expected', function (done) {
        request({
            uri: 'https://www.airbnb.com/rooms/3266217',
            headers: {'User-Agent': ro.getUserAgent()}
        }, function (error, response, body) {
            should.not.exist(error);
            response.statusCode.should.equals(200);
            should.exist(body);

            var $ = cheerio.load(body);
            should.exist($);

            var p = new room.parser;

            //head
            var e = $('head');
            e.should.have.length.at.least(1);
            var res = p._parseHead(e);
            //console.log(res);
            res.should.have.all.keys(['region', 'country', 'city', 'rating', 'map_lat', 'map_lng']);
            res.map_lat.should.be.closeTo(35.5, 1.0);
            res.map_lng.should.be.closeTo(139.5, 1.0);
            res.should.be.like({
                region: 'Tokyo',
                country: 'Japan',
                city: 'Shibuya',
                rating: 5,
                map_lat: res.map_lat,   //skip these 2 because the value is a bit random
                map_lng: res.map_lng });

            //listing name
            e = $('#listing_name');
            e.should.have.length.at.least(1);
            res = p._parseListingName(e);
            //console.log(res);
            res.should.be.like({
                listing_name: 'Prime 1BR Terrace @Harajuku' });

            //summary
            e = $('#summary');
            e.should.have.length.at.least(1);
            res = p._parseSummary(e);
            //console.log(res);
            res.should.be.like({
                rent_type: 'entireplace' });

            //pricing
            e = $('.book-it__price');
            e.should.have.length.at.least(1);
            res = p._parsePricing(e);
            //console.log(res);
            res.default_price.should.be.closeTo(200, 100.0);
            res.default_price_currency.should.be.like('USD');

            //details
            e = $('#details-column');
            e.should.have.length.at.least(1);
            res = p._parseDetails(e);
            console.log(res);
            //todo:should check some details here too

            //details
            e = $('.wish_list_button');
            e.should.have.length.at.least(1);
            res = p._parseWishlist(e);
            console.log(res);
            //todo:should check some details here too

            //details
            e = $('#reviews');
            e.should.have.length.at.least(1);
            res = p._parseReviews(e);
            console.log(res);
            //todo:should check some details here too

            //details
            e = $('#host-profile');
            e.should.have.length.at.least(1);
            res = p._parseHostProfile(e);
            console.log(res);
            res.should.be.like({
                host_id: '16320275',
                host_name: 'Kan Gab Bob',
                response_rate: res.response_rate,
                response_time: res.response_time });

            done();
        });
    });


    //u.extend(r, this._parseHead(this.$('head')));                  //region, country, city, rating
    //u.extend(r, this._parseListingName(this.$('#listing_name')));  //listing_name
    //u.extend(r, this._parseUserImage(this.$('.user-image')));      //host_id, host_name
    //u.extend(r, this._parseSummary(this.$('#summary')));           //rent_type
    //u.extend(r, this._parsePricing(this.$('#pricing')));           //default_price, default_price_currency
    //u.extend(r, this._parseMap(this.$('#map')));                   //map_lat, map_lng
    //u.extend(r, this._parseDetails(this.$('#details-column')));    //all key-value pairs i.e. property_type, beds, etc
    //u.extend(r, this._parseWishlist(this.$('.wish_list_button'))); //img, address, listing_id, wishlist
    //u.extend(r, this._parseReviews(this.$('#reviews')));           //reviews, rating_xxx
    //u.extend(r, this._parseHostProfile(this.$('#host-profile')));  //response_rate, response_time
});


