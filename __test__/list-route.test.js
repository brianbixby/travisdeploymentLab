'use strict';

const request = require('superagent');
const serverToggle = require('../lib/server-toggle.js');
const server = require('../server.js');

const User = require('../model/user.js');
const List = require('../model/list.js');

require('jest');
const url = 'http://localhost:3000';

const exampleUser = { username: 'exampleuser', password: '1234', email: 'exampleuser@test.com' };
const exampleList = { name: 'test list', desc: 'test list desc' };
const exampleList2 = { name: 'test list2', desc: 'test list desc2' };
const exampleList3 = {name: 'test list3' };
const updatedList = { name: 'test list2', desc: 'test list desc2' };

describe('List routes', function() {
  beforeAll(done => {
    serverToggle.serverOn(server, done);
  });
  afterAll(done => {
    serverToggle.serverOff(server, done);
  });
  afterEach( done => {
    Promise.all([
      User.remove({}),
      List.remove({}),
    ])
      .then( () => done())
      .catch(done);
  });

  describe('POST: /api/list', () => {
    beforeEach( done => {
      new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => user.save())
        .then( user => {
          console.log('this.tempuser ', this);
          this.tempUser = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
    });

    it('should return a list', done => {
      request.post(`${url}/api/list`)
        .send(exampleList)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).toEqual(200);
          expect(res.body.desc).toEqual(exampleList.desc);
          expect(res.body.name).toEqual(exampleList.name);
          expect(res.body.userID).toEqual(this.tempUser.id.toString());
          done();
        });
    });

    it('should return 404 for route not found', done => {
      request.post(`${url}/api/li`)
        .send(exampleList)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          expect(res.status).toEqual(404);
          done();
        });
    });

    it('should return a 401 error, no token', done => {
      request.post(`${url}/api/list`)
        .send(exampleList)
        .set({
          Authorization: 'Bearer ',
        })
        .end((err, res) => {
          expect(res.status).toEqual(401);
          done();
        });
    });

    it('should return a 400 error, no body', done => {
      request.post(`${url}/api/list`)
        .send()
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          expect(res.status).toEqual(400);
          done();
        });
    });

    it('should return a 400 error, body error', done => {
      request.post(`${url}/api/list`)
        .send(exampleList3)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          expect(res.status).toEqual(400);
          done();
        });
    });
  });

  describe('GET: /api/list/:listId && /api/list', () => {
    beforeEach( done => {
      new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
    });

    beforeEach( done => {
      exampleList.userID = this.tempUser.id.toString();
      new List(exampleList).save()
        .then( list => {
          this.tempList = list;
          done();
        })
        .catch(done);
    });

    beforeEach( done => {
      exampleList2.userID = this.tempUser.id.toString();
      new List(exampleList2).save()
        .then( list2 => {
          this.tempList2 = list2;
          done();
        })
        .catch(done);
    });

    afterEach( () => {
      delete exampleList.userID;
    });

    it('should return a list and a 200 status', done => {
      request.get(`${url}/api/list/${this.tempList.id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).toEqual(200);
          expect(res.body.name).toEqual(exampleList.name);
          expect(res.body.desc).toEqual(exampleList.desc);
          expect(res.body.userID).toEqual(this.tempUser.id.toString());
          done();
        });
    });

    it('should return a 401 when no token is provided', done => {
      request.get(`${url}/api/list/${this.tempList.id}`)
        .set({
          Authorization: 'Bearer',
        })
        .end((err, res) => {
          expect(res.status).toEqual(401);
          done();
        });
    });

    it('should return a 404 for a valid req with a list id not found', done => {
      request.get(`${url}/api/list/a979e472c577c679758e018`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          expect(res.status).toEqual(404);
          done();
        });
    });

    it('should return all lists and a 200 status', done => {
      request.get(`${url}/api/lists`)
        .set({
          Authorization: `Bearer ${this.tempToken}`, 
        })
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).toEqual(200);
          expect(res.body[0].name).toEqual(exampleList.name);
          expect(res.body[0].desc).toEqual(exampleList.desc);
          expect(res.body[0].userID).toEqual(this.tempUser.id.toString());
          expect(res.body[1].name).toEqual(exampleList2.name);
          expect(res.body[1].desc).toEqual(exampleList2.desc);
          expect(res.body[1].userID).toEqual(this.tempUser.id.toString());
          done();
        });
    });

    it('should return a 401 when no token is provided', done => {
      request.get(`${url}/api/lists`)
        .set({
          Authorization: 'Bearer',
        })
        .end((err, res) => {
          expect(res.status).toEqual(401);
          done();
        });
    });
  });

  describe('DELETE: /api/list/:listId && /api/list', () => {
    beforeEach( done => {
      new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
    });

    beforeEach( done => {
      exampleList.userID = this.tempUser.id.toString();
      new List(exampleList).save()
        .then( list => {
          this.tempList = list;
          done();
        })
        .catch(done);
    });

    afterEach( () => {
      delete exampleList.userID;
    });

    it('should delete a list and return a 204 status', done => {
      request.delete(`${url}/api/list/${this.tempList.id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).toEqual(204);
          done();
        });
    });

    it('should not delete and return a 401 when no token is provided', done => {
      request.delete(`${url}/api/list/${this.tempList.id}`)
        .set({
          Authorization: 'Bearer',
        })
        .end((err, res) => {
          expect(res.status).toEqual(401);
          done();
        });
    });

    it('should not delete and return a 404 error for a valid req with a list id not found', done => {
      request.delete(`${url}/api/list/404`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          expect(res.status).toEqual(404);
          done();
        });
    });

    it('should not delete and return a 400 error for a req with no list id', done => {
      request.delete(`${url}/api/list`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          expect(res.status).toEqual(400);
          done();
        });
    });
  });

  describe('PUT: /api/list/:listId && /api/list', () => {
    beforeEach( done => {
      new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
    });

    beforeEach( done => {
      exampleList.userID = this.tempUser.id.toString();
      new List(exampleList).save()
        .then( list => {
          this.tempList = list;
          done();
        })
        .catch(done);
    });

    afterEach( () => {
      delete exampleList.userID;
    });

    it('should update and return a list with a 200 status', done => {
      request.put(`${url}/api/list/${this.tempList.id}`)
        .send(updatedList)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).toEqual(200);
          expect(res.body.desc).toEqual(updatedList.desc);
          expect(res.body.name).toEqual(updatedList.name);
          expect(res.body.userID).toEqual(this.tempUser.id.toString());
          done();
        });
    });

    it('should  not update and return a 400 status for invalid req', done => {
      request.put(`${url}/api/list/${this.tempList.id}`)
        .send()
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          expect(res.status).toEqual(400);
          done();
        });
    });

    it('should  not update and return a 401 status', done => {
      request.put(`${url}/api/list/${this.tempList.id}`)
        .send(updatedList)
        .set({
          Authorization: `Bearer `,
        })
        .end((err, res) => {
          expect(res.status).toEqual(401);
          done();
        });
    });

    it('should  not update and return a 404 status for user list not found', done => {
      request.put(`${url}/api/list/a979e472c577c679758e018`)
        .send(updatedList)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          expect(res.status).toEqual(404);
          done();
        });
    });

    it('should  not update and return a 400 error for a req with no list id', done => {
      request.put(`${url}/api/list`)
        .send(updatedList)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          expect(res.status).toEqual(400);
          done();
        });
    });


  });
});