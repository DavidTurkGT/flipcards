const assert = require('assert');
const request = require('supertest');
const Models = require('../models');
const app = require('../server');

let User, Deck, Card;

before("Setting up...", (done) => {
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

describe("A deck", () => {

  it("can be created" , (done) => {
    request(app)
      .post('/deck/for/'+User.id)
      .send({name: "newDeck"})
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect( (res) => {
        assert(res, "No response received");
        assert(res.body, "No body sent with the response");
        assert(res.body.deck, "No deck sent with the response");
        let newDeck = res.body.deck;
        assert(newDeck.name, "Deck has no name");
        assert.equal(newDeck.name, "newDeck", "Name of new deck is not newDeck. Received: " + newDeck.name);
        assert(newDeck.userID, "Deck has no association with a user");
        assert.equal(newDeck.userID,User.id,"Associated user ID is not equal to 1. Received: " + newDeck.userID)
      })
      .end( (err, res) => {
        if(err) done(err);
        else done();
      });
  });

  it("will throw an error if name is blank when created", (done) => {
    request(app)
    .post('/deck/for/'+User.id)
    .send({name: ""})
    .expect(400)
    .end( (err, res) => {
      if(err) done(err)
      else done();
    });
  });

  it("will throw and error if the name is already taken when created", (done) => {
    request(app)
    .post('/deck/for/'+User.id)
    .send({name: "testDeck"})
    .expect(400)
    .end( (err, res) => {
      if(err) done(err);
      else done();
    });
  });

  it("will throw an error if an associated user is not found when created", (done) => {
    request(app)
    .post('/deck/for/1989')
    .send({name: "ThisWillFail"})
    .expect(404)
    .end( (err, res) => {
      if(err) done(err);
      else done();
    });
  });

  it("can be retrieved from the database", (done) => {
    request(app)
      .get("/deck/"+Deck.id)
      .expect(200)
      .expect('Content-Type','application/json; charset=utf-8')
      .expect( (res) => {
        assert(res, 'No response sent');
        assert(res.body, 'No body attached to response');
        assert(res.body.deck, 'No deck sent with the response');
        let retrievedDeck = res.body.deck;
        assert(retrievedDeck.id, "Deck has no id");
        assert.equal(retrievedDeck.id, Deck.id, "ID's do not match. Received: " +retrievedDeck.id +". Expected: "+Deck.id);
        assert(retrievedDeck.name, 'A deck has no name');
        assert.equal(retrievedDeck.name,Deck.name, "Names do not match. Received: "+retrievedDeck.name+". Expected: "+Deck.name);
      })
      .end( (err, res) => {
        if(err) done(err);
        else done();
      });
  });

  it("throws an error when a deck is not found", (done) => {
    request(app)
    .get('/deck/1989')
    .expect(404)
    .end( (err, res) =>{
      if(err) done(err);
      else done();
    });
  });

  it("is associated with a user", (done) => {
    request(app)
      .get('/deck/'+Deck.id)
      .expect(200)
      .expect('Content-Type','application/json; charset=utf-8')
      .expect( (res) => {
        assert(res, 'No response received');
        assert(res.body, 'No response body received');
        assert(res.body.deck, 'No deck received');
        let retrievedDeck = res.body.deck;
        assert(retrievedDeck.user, 'Deck has no user associated');
        let retrievedUser = retrievedDeck.user;
        assert(retrievedUser.id, 'Associated user has no ID');
        assert.equal(retrievedUser.id, User.id, "ID's do not match. Expected: "+retrievedUser.id+". Expected: "+User.id);
        assert(retrievedUser.username, 'Associated user has no username');
      })
      .end( (err, res) => {
        if(err) done(err);
        else done();
      })
  });

  it("has cards associated with it", (done) => {
    request(app)
      .get('/deck/'+Deck.id)
      .expect(200)
      .expect('Content-Type','application/json; charset=utf-8')
      .expect( (res) => {
        assert(res, 'No response received');
        assert(res.body, 'No response body received');
        assert(res.body.deck, 'No deck received');
        let retrievedDeck = res.body.deck;
        assert(retrievedDeck.cards, 'No cards associated with deck');
        assert.equal(retrievedDeck.cards[0].id, Card.id, "Card ID's do not match. Received: "+retrievedDeck.cards[0].id+". Expected: "+Card.id);
      })
      .end( (err, res) => {
        if(err) done(err);
        else done(err)
      })
  });

  it("can be updated with a new name", (done) => {
    request(app)
      .put('/deck/'+Deck.id)
      .send({ name: "totallyNewDeck" })
      .expect(200)
      .expect('Content-Type','application/json; charset=utf-8')
      .expect( (res) => {
        assert(res, 'No response received');
        assert(res.body, 'No response body received');
        assert(res.body.deck, 'No deck received');
        let retrievedDeck = res.body.deck;
        assert.equal(retrievedDeck.name,"totallyNewDeck","Names do not match. Received: "+retrievedDeck.name+". Expected: totallyNewDeck");
      })
      .end( (err, res) => {
        if(err) done(err);
        else done();
      });
  });

  it("will not be updated if no deck is found; instead throws and error", (done) => {
    request(app)
      .put('/deck/1989')
      .expect(404)
      .end( (err, res) => {
        if(err) done(err);
        else done();
      });
  });

  it("can be deleted from the database", (done) => {
    //Test deleting a deck
    request(app)
      .delete('/deck/'+Deck.id)
      .expect(200)
      .end( (err, res) => {
        if(err) done(err);
        else{
          request(app)
          .get('/deck/'+Deck.id)
          .expect(404)
          .end( (err, res) => {
            if(err) done(err);
            else done();
          });
        }
      })
  });

  it("will throw an error if no deck is found when deleting", (done) => {
    request(app)
      .delete('/deck/'+Deck.id)
      .expect(404)
      .end( (err, res) => {
        if(err) done(err);
        else done();
      });
  });

});
