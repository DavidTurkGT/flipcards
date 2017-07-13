const express = require('express');
const router = express.Router();
const Models = require('../models');

function validateRequest (req, res, next) {
  req.checkBody("name", "Name cannot be blank").notEmpty();

  let errors = req.validationErrors();

  if(errors){
    let errMsg = [];
    errors.forEach( (err) => errMsg.push(err.msg) );
    res.status(400).json({errors: errMsg});
  }
  else{
    //Make sure name is unique
    Models.Deck.find({ where: {name: req.body.name} })
    .catch( (err) => res.status(500).send(err) )
    .then( (deck) => {
      if(deck){
        res.status(400).send("Deck name is already taken");
      }
      else{
        next();
      }
    })
  }
}

function findDeck (req, res, next) {
  Models.Deck.find({ where: {id: req.params.deckId} })
  .catch( (err) => res.status(500).send(err) )
  .then( (deck) => {
    if(!deck){
      res.status(404).send("No deck found");
    }
    else{
      //Retrieve User
      Models.User.findById(deck.userID)
      .catch( (err) => res.status(500).send(err) )
      .then( (user) => {
        if(!user){
          res.status(404).send("No associated user");
        }
        else{
          deck.user = user.dataValues;
          //Find associated cards
          Models.Flipcard.findAll({
            where: {deckID: req.params.deckId}
          })
          .catch( (err) => res.status(500).send(err) )
          .then( (cards) => {
            let foundCards = [];
            cards.forEach( (card) => foundCards.push(card.dataValues) );
            deck.cards = foundCards;
            req.deck = deck;
            next();
          })
        }
      })
    }
  })
}

function deleteCards (req, res, next) {
  Models.Flipcard.findAll({ where: { deckID: req.params.deckId } })
  .catch( (err) => res.status(500).send(err) )
  .then( (cards) => {
    cards.forEach( (card) => {
      card.destroy().catch( (err) => res.status(500).send(err) );
    });
    next();
  });
}

router.post('/for/:userId', validateRequest, (req, res) => {
  //Make sure the user is a valid user
  Models.User.find({ where: {id: req.params.userId} })
  .catch( (err) => res.status(500).send(err) )
  .then( (user) => {
    if(!user){
      res.status(404).send("Not a valid user");
    }
    else{
      let newDeck = {
        name: req.body.name,
        userID: req.params.userId
      };
      Models.Deck.create(newDeck)
      .catch( (err) => res.status(500).send(err) )
      .then( (newDeck) => {
        res.status(200).json({deck: newDeck});
      })
    }
  })
});

router.get('/:deckId', findDeck, (req, res) => {
  let deck = req.deck.dataValues;
  deck.user = req.deck.user;
  deck.cards = req.deck.cards;
  res.status(200).json({deck: deck});
});

router.put('/:deckId', (req, res) => {
  Models.Deck.findById(req.params.deckId)
  .catch( (err) => res.status(500).send(err) )
  .then( (deck) => {
    if(!deck){
      res.status(404).send('No deck found');
    }
    else{
      deck.name = req.body.name || deck.name;
      deck.save()
      .catch( (err) => res.status(500).send(err) )
      .then( (deck) => {
        res.status(200).json({deck: deck});
      });
    }
  });
});

router.delete('/:deckId', findDeck, deleteCards, (req, res) => {
  Models.Deck.findById(req.params.deckId)
  .catch( (err) => res.status(500).send(err) )
  .then( (deck) => {
    deck.destroy()
    .catch( (err) => res.status(500).send(err) )
    .then( () => {
      res.status(200).json({deck: deck});
    });
  });
});

module.exports = router;
