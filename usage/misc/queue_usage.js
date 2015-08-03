var Queue = require('../../lib/queue');

q = new Queue();

q.enqueue(['1', '2', '3', '4']);
q.on('process', function (id) {
    console.log(id);
});

process.on('exit', function(x, y){
    console.log(x, y);
});

q.start();
