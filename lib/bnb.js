var room = require('./room');
var search = require('./search');
var calendar = require('./calendar');

module.exports.getRoom = room.getRoom;
module.exports.parseRoom = room.parseRoom;
module.exports.structurizeRoom = room.structurizeRoom;

module.exports.search = search.search;
module.exports.searchAll = search.searchAll;

module.exports.getCalendar = calendar.getCalendar;