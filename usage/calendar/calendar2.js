var calendar = require('../../lib/calendar');
//var calendar = require('../../lib/bnb');
var logger = require('../../lib/logger');

//test rate limit
calendar.getCalendar('3266217', {month:1}).then(logger.info);
//calendar.getCalendar('3266217', {month:1}).then(logger.info);
//calendar.getCalendar('3266217', {month:1}).then(logger.info);
//calendar.getCalendar('3266217', {month:1}).then(logger.info);
//calendar.getCalendar('3266217', {month:1}).then(logger.info);
//calendar.getCalendar('3266217', {month:1}).then(logger.info);
//calendar.getCalendar('3266217', {month:1}).then(logger.info);
//calendar.getCalendar('3266217', {month:1}).then(function(json){console.log(JSON.stringify(json))});

//test error
//calendar.getCalendar('326621fefe7').then(logger.info).catch(logger.error);