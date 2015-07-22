var u = require('underscore');

function structurizeRoom(i) {
    var o = {};

    o = {timestamp: i.timestamp, id: i.id, name: i.listing_name};

    o.host = {id: i.host_id, name: i.host_name, response: {rate: i.response_rate, time: i.response_time}};

    o.prop = {type: i.property_type, scope: i.rent_type};
    o.prop = u.extend(o.prop, u.pick(i, 'accommodates', 'bedrooms', 'bathrooms', 'img'));

    o.location = u.pick(i, 'city', 'region', 'country', 'address');
    o.location.geo = {lat: i.map_lat, lon: i.map_lng};

    o.price = {default: i.default_price, currency: i.default_price_currency};

    o.extra = {
        cleaning: i.cleaning_fee,
        security: i.security_deposit,
        guest: {fee: i.extra_guest_fee, after: i.extra_guest_after}
    };

    o.restrict = {checkin: i.check_in, checkout: i.check_out, minstay: i.min_stay};

    o.stat = u.pick(i, 'wishlist', 'reviews');
    //remove leading rating_ from rating_accuracy, ...
    o.stat.rating = u.keys(i).filter(function (s) {
        return s.match('rating_')
    }).reduce(function (obj, k) {
        obj[k.replace('rating_', '')] = i[k];
        return obj
    }, {});
    if (i.rating > 0) {
        o.stat.rating.overall = i.rating;
    }
    o.enrich = {geo: i.use_geo};

    return o;
}

//function estimatePrice(i){
//    var est_guest = i.bedrooms + (i.accommodates/i.bedrooms);
//    if (i.extra_guest_after && i.extra_guest_fee) {
//        var est_price = Math.max(0, (est_guest - i.extra_guest_after)) * i.extra_guest_fee;
//    }
//}

module.exports.structurizeRoom = structurizeRoom;