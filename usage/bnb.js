var bnb = require('./../lib/bnb');

bnb.getRoom('3160954') //ok
    .then(function (room) {
        console.log('\nroom');
        console.log(room);
    })
    .catch(function (error) {
        console.error(error.name);
    });

bnb.search('Tokyo-Station--Tokyo--Japan', 7).
    then(function(ids){
        console.log('\nsearch');
        console.log(ids);
});

bnb.getCalendar('3160954').
    then(function(cal){
        console.log('\ncalendar');
        console.log(cal);
    });

