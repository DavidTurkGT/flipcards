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

describe("A flipcard", () => {

  it("can be created", (done) => {
    let newCard = {
      question: "Will this be created?",
      answer: "Hopefully"
    };
    request(app)
      .post('/cards/in/'+Deck.id)
      .send(newCard)
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect( (res) => {
        assert(res, 'No response given');
        assert(res.body, 'No response body');
        assert(res.body.card, 'No card received');
        let sentCard = res.body.card;
        assert(sentCard.question,"Received card has no question");
        assert.equal(sentCard.question, newCard.question, "Questions are not equal");
        assert(sentCard.answer, 'Received card has no answer');
        assert.equal(sentCard.answer, newCard.answer, "Answers are not equal");
      })
      .end( (err, res) => {
        if(err) done(err);
        else done();
      });
  });

  it("will throw an error if the question is blank", (done) => {
    request(app)
      .post('/cards/in/'+Deck.id)
      .send({
        question: "",
        answer: "This fails",
        deckID: Deck.id
      })
      .expect(400)
      .end( (err, res) => {
        if(err) done(err);
        else done();
      });
  });

  it("will throw an error if the answer is blank", (done) => {
    request(app)
      .post('/cards/in/'+Deck.id)
      .send({
        question: "Does this fail?",
        answer: "",
        deckID: Deck.id
      })
      .expect(400)
      .end( (err, res) => {
        if(err) done(err);
        else done();
      });
  });

  it("will throw an error if no deck is found", (done) => {
    request(app)
      .post('/cards/in/1989')
      .send({
        question: "Does this fail?",
        answer: "Yes. It does",
      })
      .expect(404)
      .end( (err, res) => {
        if(err) done(err);
        else done();
      });
  });

  it("can be retrieved from the database", (done) => {
    request(app)
      .get('/cards/'+Card.id)
      .expect(200)
      .expect('Content-Type','application/json; charset=utf-8')
      .expect( (res) => {
        assert(res, 'No response received');
        assert(res.body, 'No response body received');
        assert(res.body.card, 'No card received');
        let retrievedCard = res.body.card;
        assert.equal(retrievedCard.id, Card.id, "ID's do not match. Received: "+retrievedCard.id+". Expected: "+Card.id);
        assert(retrievedCard.question, "Card has no question");
        assert(retrievedCard.answer, "Card has no answer");
      })
      .end( (err, res) => {
        if(err) done(err);
        else done();
      });
  });

  it("is associated with a deck", (done) => {
    request(app)
    .get('/cards/'+Card.id)
    .expect(200)
    .expect('Content-Type','application/json; charset=utf-8')
    .expect( (res) => {
      assert(res, 'No response received');
      assert(res.body, 'No response body received');
      assert(res.body.card, 'No card received');
      let retrievedCard = res.body.card;
      assert(retrievedCard.deck, 'No deck associated with card');
      let retrievedDeck = retrievedCard.deck;
      assert.equal(retrievedDeck.id,Deck.id,"ID's do not match. Received: "+retrievedDeck.id+". Expected: "+Deck.id);
    })
    .end( (err, res) => {
      if(err) done(err);
      else done();
    });
  });

  it("will throw an error if no flipcard is found when retrieved", (done) => {
    request(app)
      .get('/cards/1989')
      .expect(404)
      .end( (err, res) => {
        if(err) done(err);
        else done();
      })
  });

  it("can be updated in the database", (done) => {
    request(app)
      .put('/cards/'+Card.id)
      .send({
        question: "newQuestion"
      })
      .expect(200)
      .expect('Content-Type','application/json; charset=utf-8')
      .expect( (res) => {
        assert(res,'No response received');
        assert(res.body, 'No response body received');
        assert(res.body.card, 'No card received');
        let retrievedCard = res.body.card;
        assert(retrievedCard.question,'Retrieved card has no question');
        assert.equal(retrievedCard.question,"newQuestion",'Updated questions do not match. Received: '+retrievedCard.question+". Expected: newQuestion");
        assert(retrievedCard.answer, 'Retrieved card has no answer');
        assert.equal(retrievedCard.answer,"No","Updated card has wrong answer. Received: "+retrievedCard.answer+". Expected: No");
      })
      .end( (err, res) => {
        if(err) done(err);
        else done();
      })
  });

  it("will throw an error if no card is found when updating", (done) => {
    request(app)
      .put('/cards/1989')
      .expect(404)
      .end( (err, res) => {
        if(err) done(err);
        else done();
      })
  });

  it("can be deleted from the database", (done) => {
    request(app)
      .delete('/cards/'+Card.id)
      .expect(200)
      .end( (err, res) => {
        if(err) done(err);
        else{
          request(app)
            .get('/cards/'+Card.id)
            .expect(404)
            .end( (err, res) => {
              if(err) done(err);
              else done();
            })
        }
      })
  });

  it("will throw an error if no card is found when deleting", (done) => {
    request(app)
      .delete('/cards/1989')
      .expect(404)
      .end( (err, res) => {
        if(err) done(err);
        else done();
      })
  });

});
