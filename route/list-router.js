'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const debug = require('debug')('16-basic-auth:list-router');
const createError = require('http-errors');

const List = require('../model/list.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

const listRouter = module.exports = Router();

listRouter.post('/api/list', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST: /api/list');

  req.body.userID = req.user._id;
  new List(req.body).save()
    .then( list => res.json(list))
    .catch(next);
});

listRouter.get('/', function(req, res, next) {
  debug('GET: /');
  
  res.send('Please proceed to /api/signup')
    .catch(next);
});

listRouter.get('/api/list/:listId', bearerAuth, function(req, res, next) {
  debug('GET: /api/list/:listId');

  List.findById(req.params.listId)
    .then( list => res.json(list))
    .catch(next);
});

listRouter.get('/api/lists', bearerAuth, function(req, res, next) {
  debug('GET: /api/lists');

  List.find()
    .then(lists => res.json(lists))
    .catch(next);
});

listRouter.put('/api/list/:listId', bearerAuth, jsonParser, function(req, res, next) {
  debug('PUT: /api/list:listId');
  if (!req.body.name || !req.body.desc) return next(createError(400, 'expected a request body name or desc'));

  List.findByIdAndUpdate(req.params.listId, req.body, {new: true})
    .then( list => res.json(list))
    .catch(next);
});

listRouter.put('/api/list', bearerAuth, jsonParser, function(req, res, next) {
  debug('PUT: /api/list');
  return next(createError(400, 'expected a list ID'));
});


listRouter.delete('/api/list/:listId', bearerAuth, function(req, res, next) {
  debug('DELETE: /api/list/:listId');

  List.findByIdAndRemove(req.params.listId)
    .then( () => res.status(204).send())
    .catch(next);
});

listRouter.delete('/api/list', bearerAuth, function(req, res, next) {
  debug('DELETE: /api/list');
  return next(createError(400, 'expected a list ID'));
});