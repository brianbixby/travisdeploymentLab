'use strict';

const debug = require('debug')('16-basic-auth:server-toggle.js');
const mongoose = require('mongoose');

module.exports = exports = {};

exports.serverOn = function(server, done) {
  if(!server.isRunning) {
    server.listen(process.env.PORT, () => {
      server.isRunning = true;
      debug('server up');
      done();
    });
    return;
  }
  done();
};

exports.serverOff = function(server, done) {
  if(server.isRunning) {
    server.close(err => {
      if (err) return done(err);
      server.isRunning = false;
      mongoose.connection.close();
      debug('server down');
      done();
    });
    return;
  }
  done();
};