var bnb = require('/apps/bnb-lib')
var u = require('/apps/bnb-lib/node_modules/underscore')

var i;
bnb.getRoom('3266217').then(function(j){
	i = j;
})

//structurize
var o = {};

o = {timestamp: i.timestamp, id: i.id, name: i.listing_name};

o.host = {id: i.host_id, name: i.host_name, response: {rate: i.response_rate, time: i.response_time}};

o.prop = {type: i.property_type, scope: i.rent_type};
o.prop = u.extend(prop, u.pick(i, 'accommodates', 'bedrooms', 'bathrooms', 'img'));

o.location = u.pick(i, 'city', 'region', 'country', 'address');
o.location.geo = {'lat': i.map_lat, 'lon': i.map_lng} ;

o.price = {'default': i.default_price, 'currency': i.default_price_currency};
o.extra = {'cleaning': i.cleaning_fee, 'security': i.security_deposit, guest: {fee: i.extra_guest_fee, after: i.extra_guest_after}};

o.restrict = {'checkin': i.check_in, 'checkout': i.check_out, minstay: i.min_stay};

o.stat = u.pick(i, 'wishlist', 'reviews');
o.stat.rating = u.keys(i).filter(function(s){return s.match('rating_')}).reduce(function(obj, k){obj[k.replace('rating_', '')]=i[k]; return obj}, {});
o.stat.rating.overall = i.rating;

o.enrich = {geo: i.use_geo};

o


//try
o
rating
i['rating']
i
f
u.extend(o.rating, u.mapObject(i.pick(i, def.digitFields), digits));

> { timestamp: Sat Jul 18 2015 10:19:17 GMT+0900 (JST),
  region: 'Tokyo-to',
  country: 'Japan',
  city: 'Shibuya-ku',
  rating: 5,
  listing_name: 'Prime 1BR Terrace @Harajuku',
  host_id: '16320275',
  host_name: 'Kan Gab Bob',
  rent_type: 'entireplace',
  default_price: 249,
  default_price_currency: 'USD',
  map_lat: 35.67007625833921,
  map_lng: 139.70536302960696,
  property_type: 'Apartment',
  accommodates: 5,
  bedrooms: 1,
  bathrooms: 1,
  beds: 2,
  check_in: '4:00 PM',
  check_out: '12:00 PM (noon)',
  extra_people: '$17 / night after 2 guests',
  cleaning_fee: 42,
  security_deposit: 83,
  cancellation: 'Strict',
  min_stay: 2,
  extra_guest_fee: 17,
  extra_guest_after: 2,
  img: 'https://a1.muscache.com/ac/pictures/53577159/12716e88_original.jpg?interpolation=lanczos-none&size=large&output-format=jpg&output-quality=70',
  address: '1 Chome Jingumae, Shibuya (Harajuku)',
  id: '3266217',
  wishlist: 281,
  reviews: 42,
  rating_accuracy: 5,
  rating_communication: 5,
  rating_cleanliness: 5,
  rating_location: 5,
  rating_check_in: 4.5,
  rating_value: 4.5,
  response_rate: 93,
  response_time: 'within an hour',
  use_geo: true }