var Pusher = require('pusher-node-client').PusherClient;
var bindAll = require('lodash.bindall');

var Cryptsy = function(market, prefix) {
  bindAll(this);

  this.channel_prefix = prefix ? prefix : 'trade';

  this.client = new Pusher({
    key: 'cb65d0a7a72cd94adf1f',
    appId: '',
    secret: ''
  });

  this.queue = [];
  this.connected = false;

  if(market)
    this.subscribe(market, prefix);

  this.client.on('connect', this._subscribeQueue);
  this.client.connect();
}

var util = require('util');
var EventEmitter = require('events').EventEmitter;
util.inherits(Cryptsy, EventEmitter);

// subscribe if connected, else queue until
// we are connected
Cryptsy.prototype.subscribe = function(market) {

  // if array, recurse
  if(market instanceof Array)
    return market.forEach(this.subscribe);

  var chanName = this.channel_prefix + '.' + market;

  if(this.connected)
    this._subscribe(chanName);
  else
    this.queue.push(chanName);
};

Cryptsy.prototype._subscribeQueue = function() {
  this.connected = true;
  this.queue.forEach(this._subscribe);
  this.queue = [];
}

Cryptsy.prototype._subscribe = function(market) {
  this.client.subscribe(market)
    .on('message', this.handle);
}

Cryptsy.prototype.handle = function(e) {
  this.emit(this.channel_prefix, e);
};

module.exports = Cryptsy;
