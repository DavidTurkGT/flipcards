const assert = require('assert');
const request = require('supertest');
const Models = require("../models");
const app = require("../server");

let User, Deck, Card;

before("Starting up...", (done) => {
  let newUser = {
    username: 'testUser',
    passwordSalt: 'testSalt',
    passwordIterations: 2000,
    passwordHash: 'testHash'
  };
  Models.User.create(newUser).then( (newUser) => {
    User = newUser;
    let newDeck = {
      name: "testDeck",
      userID: newUser.dataValues.id
    };
    Models.Deck.create(newDeck).then( (newDeck) => {
      Deck = newDeck;
      let newCard = {
        question: "Are your tests passing?",
        answer: "No",
        deckID: newDeck.dataValues.id
      };
      Models.Flipcard.create(newCard).then( (newCard) => {
        Card = newCard;
        done();
      });
    });

  });
});

after("Cleaning up...", (done) => {
  Models.Flipcard.destroy({
    where: {}
  }).then( () => {
    Models.Deck.destroy({
      where: {}
    }).then( () => {
      Models.User.destroy({
        where: {}
      }).then( () => {
        done();
      });
    });
  });
});

describe("A user", () => {

  it("can be created", (done) => {
    let newUser = {
      username: "test",
      password: "password"
    };
    request(app)
      .post('/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect( (res) => {
        assert(res, 'No response received');
        assert(res.body, 'No response body received');
        assert(res.body.newUser, 'No new user sent with the response');
        newUser = res.body.newUser;
        assert(newUser.username, 'New user does not have a username');
        assert.equal(newUser.username,'test','New user does not have the username: test. Received: ' + newUser.username);
        assert(newUser.passwordSalt, 'New user does not have password salt');
        assert(newUser.passwordIterations, 'New user does not have a password iteration');
        assert(newUser.passwordHash, 'New user does not have a password hash');
      })
      .end( (err, res) => {
        if(err) done(err);
        else done();
      });
  });

  it("will not create a new user if the username is already taken", (done) => {
    let copiedUser = {
      username: User.username,
      password: 'password'
    };
    request(app)
      .post('/users')
      .send(copiedUser)
      .expect(400)
      .expect('Content-Type','application/json; charset=utf-8')
      .expect( (res) => {
        assert(res.body.errors, 'No errors received');
        assert(res.body.errors[0], 'Errors were expected in an array of messages');
      })
      .end( (err, res) => {
        if(err) done(err);
        else done();
      });
  });

  it("will not create a new user if the username field is blank", (done) => {
    let blankUser = {
      username: "",
      password: "password"
    };
    request(app)
      .post('/users')
      .send(blankUser)
      .expect(400)
      .end( (err, res) => {
        if(err) done(err);
        else done();
      });
  });

  it("will not create a new user if password field is blank", (done) => {
    let blankUser = {
      username: "anotherTest",
      password: ""
    };
    request(app)
      .post('/users')
      .send(blankUser)
      .expect(400)
      .end( (err, res) => {
        if(err) done(err);
        else done();
      });
  });

  it("can be retieved from the database" , (done) => {
    request(app)
      .get('/users/'+User.id)
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect( (res) => {
        assert(res,'No response received');
        assert(res.body, 'No response body received');
        assert(res.body.user, 'No user sent with the response');
        let sentUser = res.body.user;
        assert(sentUser.username, 'New user does not have a username');
        assert.equal(sentUser.username,User.username,'New user does not have the username: test. Received: ' + sentUser.username);
        assert(sentUser.passwordSalt, 'New user does not have password salt');
        assert(sentUser.passwordIterations, 'New user does not have a password iteration');
        assert(sentUser.passwordHash, 'New user does not have a password hash');
      })
      .end( (err, res) => {
        if(err) done(err);
        else done();
      });
  });

  it("throws a 404 if user is not found", (done) => {
    request(app)
      .get('/users/1989')
      .expect(404)
      .end( (err, res) => {
        if(err) done(err);
        else done();
      });
  });

  it("can have its username modified", (done) => {
    request(app)
      .put('/users/'+User.id)
      .send({username: "newName"})
      .expect(200)
      .expect("Content-Type", 'application/json; charset=utf-8')
      .expect( (res) => {
        assert(res, 'No response sent');
        assert(res.body, 'No response body send');
        assert(res.body.user, 'No user sent with response');
        let modUser = res.body.user;
        assert(modUser.username, 'Modified user has no username');
        assert.equal(modUser.username, "newName", 'Username was not modified to newName. Received: ' + modUser.username);
      })
      .end( (err, res) => {
        if(err) done(err);
        else done();
      })
  });

  it("can log in successfully", (done) => {
    request(app)
      .post('/users')
      .send({ username: "david", password: "cornbread" })
      .expect(200)
      .end( (err, res) => {
        if(err) done(err);
        else{
          request(app)
            .post('/users/login')
            .send({ username: "david", password: "cornbread" })
            .expect(200)
            .end( (err, res) => {
              if(err) done(err);
              else done();
            })
        }
      });
  });

  // it("stores a logged in user in the session", (done) => {
  //   request(app)
  //     .get('/users/me')
  //     .expect(200)
  //     .expect('Content-Type','application/json; charset=utf-8')
  //     .expect( (res) => {
  //       assert(res, 'No response sent');
  //       assert(res.body, 'No response body sent');
  //       assert(res.body.session, 'No session sent with response');
  //       let session = res.body.session;
  //       assert(session.userID, 'Session has no userID');
  //       assert.equal(session.userID, User.id, 'Incorrect session userID. Should be 1. Received: ' + session.userID);
  //       assert(session.username, 'Session has no username');
  //       assert.equal(session.username,User.username, 'Incorrect session username. Should be test. Received: ' + session.username);
  //     })
  //     .end( (err, res) => {
  //       if(err) done(err);
  //       else done();
  //     })
  // });

  it("will not log in with a bad username", (done) => {
    request(app)
      .post('/users/login')
      .send({ username: "noUserNameHere", password: "123"})
      .expect(401)
      .end( (err, res) => {
        if(err) done(err);
        else done();
      });
  });

  it("will not log in if the password is wrong", (done) => {
    request(app)
      .post('/users/login')
      .send({ username: User.username, password: "notMyPW" })
      .expect(401)
      .end( (err, res) => {
        if(err) done(err);
        else done();
      })
  });

  // it("can log out and show no user on the session", (done) => {
  //   request(app)
  //     .get('/users/'+User.id+'/logout')
  //     .expect(200)
  //     .end( (err, res) => {
  //       if(err) done(err);
  //       else{
  //         request(app)
  //         .get('/users/me')
  //         .expect(404)
  //         .end( (err, res) => {
  //           if(err) done(err);
  //           else done();
  //         });
  //       }
  //     });
  // });


});
