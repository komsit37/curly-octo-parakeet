//var bnb = require('./../lib/bnb');
var room = require('./../lib/room');
var logger = require('./../lib/logger');
var should = require('../test/test-lib/chai-should');
var nodemailer = require('nodemailer');
var secret = require('../secret');

//send email if any error is found

var id = '3266217';
logger.info('requesting id ' + id + '...');
room.getRoom(id, {structurize: true}) //ok
    .then(function (room) {
        //logger.debug('callback', room);
        //console.log(JSON.stringify(room));
        try {
            logger.info('checking id ' + id +'...');
            room.id.should.equals(id);
            room.name.should.equals('Prime 1BR Terrace @Harajuku');

            room.host.response.rate.should.be.closeTo(90, 10);  room.host.response.rate = 0;
            room.host.should.be.like({"id":"16320275","name":"Kan Gab Bob","response":{"rate":0,"time":"within an hour"}});

            room.prop.img.should.have.string('https://a1.muscache.com');    room.prop.img = 'dummy';
            room.prop.should.be.like({"type":"Apartment","scope":"entireplace","accommodates":5,"bedrooms":1,"bathrooms":1,"img":"dummy"});

            room.location.geo.lat.should.be.closeTo(35.5, 1.0);     room.location.geo.lat = 0;
            room.location.geo.lon.should.be.closeTo(139.5, 1.0);    room.location.geo.lon = 0;
            room.location.should.be.like({"city":"Shibuya-ku","region":"Tokyo-to","country":"Japan","address":"1 Chome Jingumae, Shibuya (Harajuku)","geo":{"lat":0,"lon":0}});

            room.extra.cleaning.should.be.closeTo(60, 30);
            room.extra.security.should.be.closeTo(80, 30);
            room.extra.guest.fee.should.be.closeTo(20, 20);
            room.extra.guest.after.should.be.closeTo(2, 4);

            room.restrict.checkin.should.be.a('string');
            room.restrict.checkout.should.be.a('string');
            room.restrict.minstay.should.be.closeTo(3, 3);

            room.stat.wishlist.should.be.at.least(300);
            room.stat.reviews.should.be.at.least(40);

            room.stat.rating.accuracy.should.be.closeTo(5, 3);
            room.stat.rating.communication.should.be.closeTo(5, 3);
            room.stat.rating.cleanliness.should.be.closeTo(5, 3);
            room.stat.rating.location.should.be.closeTo(5, 3);
            room.stat.rating.check_in.should.be.closeTo(5, 3);
            room.stat.rating.value.should.be.closeTo(5, 3);
            room.stat.rating.overall.should.be.closeTo(5, 3);
            logger.info('All OK');
        } catch(err){
            logger.error('room check error');
            logger.error('error:', err);
            logger.error('full json:', room);

            logger.info('sending error email...');

            // create reusable transporter object using SMTP transport
            var transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: secret.EMAIL
            });

            var mailOptions = {
                from: secret.EMAIL.user,
                to: secret.EMAIL.user, // list of receivers
                subject: 'Bnb Room Check error', // Subject line
                html: '<b>Error:</b><br>' + err + '<br><br><b>Full room json:</b></b></b><pre><code>' + JSON.stringify(room, null, 4) + '</code></pre>' // html body
            };

            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    return console.log(error);
                }
                console.log('Message sent: ' + info.response);

            });
            throw(err);
        }
    });

//room.getRoom('3266217',
//    function(error, result){
//        logger.debug('promise', result)
//    });
/*
{"timestamp":"2015-08-16T07:25:17.114Z","id":"3266217","name":"Prime 1BR Terrace @Harajuku",
    "host":{"id":"16320275","name":"Kan Gab Bob","response":{"rate":98,"time":"within an hour"}},
    "prop":{"type":"Apartment","scope":"entireplace","accommodates":5,"bedrooms":1,"bathrooms":1,"img":"https://a1.muscache.com/im/pictures/53577159/12716e88_original.jpg?aki_policy=large"}
    "location":{"city":"Shibuya-ku","region":"Tokyo-to","country":"Japan","address":"1 Chome Jingumae, Shibuya (Harajuku)","geo":{"lat":35.67007625833921,"lon":139.70536302960696}},
    "price":{"default":249,"currency":"USD"},
    "extra":{"cleaning":50,"security":83,"guest":{"fee":12,"after":2}},
    "restrict":{"checkin":"4:00 PM","checkout":"12:00 PM (noon)","minstay":2},
    "stat":{"wishlist":302,"reviews":45,"rating":{"accuracy":5,"communication":5,"cleanliness":5,"location":5,"check_in":4.5,"value":4.5,"overall":5}},
    "enrich":{"geo":true}}
    */