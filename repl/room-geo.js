process.chdir('/apps/bnb-lib');
process.cwd()
var bnb = require('/apps/bnb-lib')
var geocoder = require('/apps/bnb-lib/node_modules/node-geocoder')('google', 'http');

var room;
bnb.getRoom('3266217').then(function(json){
	room = json;
})

var geo;
geocoder.reverse({lat: room.map_lat, lon: room.map_lng}).then(function(json){
	geo = json;
})

geo