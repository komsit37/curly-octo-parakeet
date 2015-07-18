//var m = require('moment');
//console.log(m().format("YYYY.MM.DD"))

function t(options){
    var x =  (options && options.x) + 1 || 1;
    console.log('options', options, ',x', x);
}

t({x:14});
t();