var bnb = require('./../lib/bnb');

bnb.getRoom('3160954') //ok
    .then(function (json) {
        console.log(json);
    })
    .catch(function (error) {
        console.error(error.name);
    });

bnb.search('Tokyo-Station--Tokyo--Japan', 7).
    then(function(ids){
        console.log(ids);
});


