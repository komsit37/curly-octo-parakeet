var room = require('./room');
var search = require('./search');

module.exports.getRoom = room.getRoom;
module.exports.parseRoom = room.parseRoom;
module.exports.search = search.search;
module.exports.searchAll = search.searchAll;