var EventEmitter = require('events').EventEmitter;
var util = require("util");

var E = require('./elastic-bnb');
var logger = require('./logger');

var EMIT = {
    ABORT: 'abort',
    START: 'start',
    PROCESS: 'process',
    COMPLETED: 'completed',
    ERROR: 'error',
    ALL_COMPLETED: 'all_completed'
};

var Queue = function () {
    var queue = this;
    queue.jobs = [];
    queue.interval = 15000;
    queue.backoff = 1;

    // Run the EventEmitter constructor
    EventEmitter.call(queue);
};


util.inherits(Queue, EventEmitter);

Queue.prototype.start = function () {
    var queue = this;
    queue.INTERVAL_ID =
        setInterval(
            function () {
                queue.process.call(queue);
            },
            queue.interval * queue.backoff);

    queue.emit(EMIT.START);
    queue.running = true;
    return queue;
};

Queue.prototype.stop = function () {
    var queue = this;
    clearInterval(queue.INTERVAL_ID);
    queue.running = false;
    return queue;
};

Queue.prototype.changeInterval = function (newbackoff) {
    var queue = this;
    if (q.running) {
        queue.stop();
        queue.backoff = newbackoff;
        logger.debug('new backoff', queue.backoff);
        queue.start();
    }
    return queue;
};

//problem: need to know when the job is done to maintain state within this queue?
Queue.prototype.process = function () {
    var queue = this;
    var id = queue.jobs.pop();

    if (id) {
        //a bit misleading here. this doesn't mean all jobs are done, just mean all jobs are queued
        //logger.debug('process next job,', id, queue.jobs.length, 'jobs left');
        queue.emit(EMIT.PROCESS, id);
    } else {
        //done
        //logger.info('all jobs processed');
        queue.emit(EMIT.COMPLETED);
        queue.stop();
    }

    return queue;
};

Queue.prototype.enqueue = function (id) {
    var queue = this;
    if (id instanceof Array) {
        id.forEach(function (x) {
            queue.jobs.push(x);
        })
    } else {
        queue.jobs.push(id);
    }
    return queue;
};


module.exports = Queue;