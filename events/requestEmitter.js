const { EventEmitter } = require('events');

class RequestEmitter extends EventEmitter {}

const requestEmitter = new RequestEmitter();

module.exports = requestEmitter;