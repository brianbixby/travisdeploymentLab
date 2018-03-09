'use strict';

const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const createError = require('http-errors');
const Promise = require('bluebird');
const debug = require('debug')('16-basic-auth:user');

const userSchema = mongoose.Schema({
  username: {type: String, require: true, unique: true },
  email: {type: String, require: true, unique: true },
  password: {type: String, require: true},
  findHash: { type: String, unique: true},
});

// creates password hash from old password
userSchema.methods.generatePasswordHash = function(password) {
  debug('generate password hash');

  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if(err) return reject(err);
      this.password = hash;
      resolve(this);
    });
  });
};


userSchema.methods.comparePasswordHash = function(password) {
  debug('comparePasswordHash');

  return new Promise((resolve, reject) => {
    bcrypt.compare(password, this.password, (err, valid) => {
      if(err) return reject(err);
      if(!valid) return reject(createError(401, 'invalid password'));
      resolve(this);
    });
  });
};

// calling it with this object which is user that was instantiated
userSchema.methods.generateFindHash = function() {
  debug('generateFindHash');

  return new Promise((resolve, reject) => {
    let tries = 0;

    _generateFindHash.call(this);

    function _generateFindHash() {
      this.findHash = crypto.randomBytes(32).toString('hex');
      this.save()
        .then( () => resolve(this.findHash))
        .catch( err=> {
          if(tries > 3) return reject(err);
          tries++;
          _generateFindHash.call(this);
        });
    }
  });
};

// this function calls generate find hash above
userSchema.methods.generateToken = function() {
  debug('generateToken');

  return new Promise((resolve, reject) => {
    this.generateFindHash()
      .then( findHash => resolve(jwt.sign({ token: findHash}, process.env.APP_SECRET)))
      .catch( err => reject(err));
  });
};

module.exports = mongoose.model('user', userSchema);