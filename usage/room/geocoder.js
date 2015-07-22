var geocoder = require('node-geocoder')('google', 'http');

//map_lat: 35.67379655280198, map_lng: 139.772523714237,
geocoder.reverse({lat: 35.67007625833921, lon: 139.70536302960696}, function(err, res) {
    console.log(res);
});

/*
[ { formattedAddress: 'Inner Circular Route, Chūō-ku, Tōkyō-to, Japan',
    latitude: 35.6759898,
    longitude: 139.7734664,
    extra:
    { googlePlaceId: 'ChIJf2AFuliJGGARAIYRaesZlI4',
        confidence: 0.7,
        premise: null,
        subpremise: null,
        neighborhood: null,
        establishment: null },
    streetName: 'Inner Circular Route',
    city: 'Chūō-ku',
    state: 'Tōkyō-to',
    stateCode: 'Tōkyō-to',
    country: 'Japan',
    countryCode: 'JP' } ]
 */