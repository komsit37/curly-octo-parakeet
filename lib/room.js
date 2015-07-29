var cheerio = require('cheerio');
var path = require('path');
var u = require('underscore');

var logger = require('./logger');
var def = require('./room_fieldDefinitions');
var utils = require('./utils.js');
var CONFIG = require('./config.js');

var request = require('request');
var Promise = require("bluebird");
var geocoder = require('node-geocoder')('google', 'http');
var limit = require("simple-rate-limiter");

var getRoom = Promise.promisify(limit(function (id, cb) {
    request({
        uri: 'https://www.airbnb.com/rooms/' + id,
        headers: {'User-Agent': utils.USER_AGENT}
    }, function (error, response, body) {
        if (error) {
            cb(error);
        }
        try {
            var room = process(body);

            if (room == null) {
                cb(new Error('room is not listed'));
            } else {
                enrichLocation(room, function (err, res) {
                    if (!err) {
                        room = res;
                    } else {
                        //intentional, just log, no need to throw enrich error
                        logger.error(err);
                    }
                    cb(null, room);
                })
            }
        } catch (ex) {
            ex.name = 'parse error: ' + ex.name;
            cb(ex);
        }
    });
}).to(CONFIG.RATE.ROOM).per(1000));

//main entry point
function process(body) {
    var $ = cheerio.load(body);
    return parseRoom($);
}

var processEnrich = function (body, callback) {
    var $ = cheerio.load(body);
    var room = parseRoom($);
    return enrichLocation(room).nodeify(callback);
}

function parseRoom($) {
    var parser = new Parser($);

    if (parser.isRoomPage()) {
        return parser.parse();
    } else {
        logger.warn('room not listed');
        return null;
    }
}

//need to limit reverse geo query, or else we'll get OVER_QUERY_LIMIT error
var enrichLocation = Promise.promisify(limit(function (room, cb) {
    geocoder.reverse({lat: room.map_lat, lon: room.map_lng}, function (err, res) {
        if (err) {
            room.use_geo = false;
            cb(err, room);
            return;
        }
        var geo = res[0];
        if (geo) {
            try {
                room.city = utils.convert_accented_characters(geo.city);
                room.region = utils.convert_accented_characters(geo.state);
                room.country = utils.convert_accented_characters(geo.country);
                room.use_geo = true;
            } catch(ex){
                ex.name = 'parse error: ' + ex.name;
                room.use_geo = false;
                cb(ex, room);
                return;
            }
        } else {
            room.use_geo = false;
        }
        cb(null, room);
    });
}).to(CONFIG.RATE.GEO).per(1000));

//Constructor
function Parser($) {
    this.$ = $;
}

//check if this html is room page
Parser.prototype.isRoomPage = function () {
    return this.$('#room').length > 0;
};

Parser.prototype.parse = function () {
    var r = {};
    r.timestamp = new Date();
    u.extend(r, this._parseHead(this.$('head')));                  //region, country, city, rating, map_lat, map_lng
    u.extend(r, this._parseListingName(this.$('#listing_name')));  //listing_name
    //do this in #host-profile instead
    //u.extend(r, this._parseUserImage(this.$('#host-profile .media-photo.media-round')));      //host_id, host_name
    u.extend(r, this._parseSummary(this.$('#summary')));           //rent_type
    u.extend(r, this._parsePricing(this.$('#pricing')));           //default_price, default_price_currency
    //doesn't work anymore, use _parseHead instead
    //u.extend(r, this._parseMap(this.$('#map')));                   //map_lat, map_lng
    u.extend(r, this._parseDetails(this.$('#details-column')));    //all key-value pairs i.e. property_type, beds, etc
    u.extend(r, this._parseWishlist(this.$('.wish_list_button'))); //img, address, listing_id, wishlist
    u.extend(r, this._parseReviews(this.$('#reviews')));           //reviews, rating_xxx
    u.extend(r, this._parseHostProfile(this.$('#host-profile')));  //host_id, host_name, response_rate, response_time
    return r;
};

//parse functions
Parser.prototype._parseHead = function ($head) {
    var r = {}, value;
    ['region', 'country', 'city'].forEach(function (s) {
        value = $head.find('meta[property="airbedandbreakfast:' + s + '"]').attr('content');
        r[s] = utils.convert_accented_characters(value);
    });
    value = $head.find('meta[property="airbedandbreakfast:rating"]').attr('content');
    r['rating'] = parseFloat(value || 0); //default to 0
    value = $head.find('meta[property="airbedandbreakfast:location:latitude"]').attr('content');
    r['map_lat'] = parseFloat(value || 0); //default to 0
    value = $head.find('meta[property="airbedandbreakfast:location:longitude"]').attr('content');
    r['map_lng'] = parseFloat(value || 0); //default to 0
    return r;
};


Parser.prototype._parseListingName = function ($listingName) {
    return {
        listing_name: utils.convert_accented_characters($listingName.text().trim())
    };
};

//extract 'entireplace' from string 'icon icon-entire-place icon-size-2'
Parser.prototype._parseSummary = function ($summary) {
    var top_icons = $summary.find('.col-sm-3 i.icon').first().attr('class');
    return {
        rent_type: top_icons.replace(/icon|size|\d|-/g, "").trim()
    };
};

Parser.prototype._parsePricing = function ($pricing) {
    return {
        default_price: digits($pricing.find('meta[itemprop="price"]').attr('content')),
        default_price_currency: $pricing.find('meta[itemprop="priceCurrency"]').attr('content')
    };
};

Parser.prototype._parseMap = function ($map) {
    var map = $map.data();
    return {
        map_lat: map.lat,
        map_lng: map.lng
    };
};

Parser.prototype._parseDetails = function ($detailsColumn) {
    //#details
    var r = {};
    $detailsColumn.find('.col-md-9 .col-md-6 div')
        .each(function () {
            var kv, delim, key, value;
            kv = cheerio(this).text();  //split key-value and add to object (ie. Property type: Apartment)
            if (kv) {
                delim = kv.indexOf(':');
                key = formatKey(kv.slice(0, delim));
                value = kv.slice(delim + 1, kv.length).trim();
                if (value) r[key] = value;
            }
        });
    r['min_stay'] = $detailsColumn.find('.col-md-9').last().find('strong').text();
    u.extend(r, u.mapObject(u.pick(r, def.digitFields), digits));   //remove non-digit chars from digit fields
    u.extend(r, readExtraPeople(r['extra_people']));
    return r;
};

Parser.prototype._parseWishlist = function ($wishListButton) {
    var wishDat = $wishListButton.data();
    return {
        img: wishDat.img,
        address: utils.convert_accented_characters(wishDat.address),
        id: wishDat.hostingId.toString(),
        wishlist: digits($wishListButton.attr('title'))
    };
};

Parser.prototype._parseReviews = function ($reviews) {
    var r = {};
    r['reviews'] = digits($reviews.find('h4').text().trim());

    $reviews.find('.star-rating')
        .each(function () {
            var el, key, rating;
            el = cheerio(this);
            key = el.parent().next('strong').text();
            if (key !== '') {
                key = 'rating_' + formatKey(key);
                rating = countStars(el);
                r[key] = rating;
            }
        });
    return r;
};

Parser.prototype._parseHostProfile = function ($hostProfile) {
    var r = {}, response_stats, photo;
    photo = $hostProfile.find('.media-photo.media-round');
    if (photo){
        r['host_id'] = path.basename(photo.attr('href'));
        r['host_name'] = photo.find('a img').attr('title');
    }

    response_stats = $hostProfile.find('.col-md-6 strong');
    if (response_stats) {
        r['response_rate'] = digits(response_stats.eq(0).text());
        r['response_time'] = response_stats.eq(1).text();
    }
    return r;
};

//------------------- helpers --------------------------
//count occurrences of icon-beach.icon-star class
function countStars($starRating) {
    return $starRating.find('i.icon-beach.icon-star').length + 0.5 * $starRating.find('i.icon-beach.icon-star-half').length;
}

//from 'Property Type: ' to 'property_type'
function formatKey(key) {
    return key.trim().toLowerCase().replace(":", "").replace(" ", "_");
}

//parse string to digits, default to 0 if no digits found
function digits(s) {
    if (s) {
        return parseInt(s.match(/[\d]+/g) || 0);
    } else {
        return 0;
    }
}

function readExtraPeople(s) {
    var fee, after, ss;
    if (!s || s === "No Charge") {
        fee = 0;
        after = 0;
    } else {
        ss = s.split('/');
        fee = digits(ss[0]);
        after = Math.max(digits(ss[1]), 1);
    }
    return {extra_guest_fee: fee, extra_guest_after: after};
}

module.exports.requiredFields = def.requiredFields;
module.exports.optionalFields = def.optionalFields;

module.exports.getRoom = getRoom;
module.exports.process = process;
module.exports.parseRoom = parseRoom;
module.exports.parser = Parser;
module.exports.processEnrich = processEnrich;
module.exports.enrichLocation = enrichLocation;

//helpers
module.exports._countStars = countStars;
module.exports._formatKey = formatKey;
module.exports._digits = digits;
module.exports._readExtraPeople = readExtraPeople;