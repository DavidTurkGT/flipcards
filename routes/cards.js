const express = require('express');
const router = express.Router();
const Models = require('../models');

function validateRequest (req, res, next) {
  req.checkBody("question","Question can't be blank").notEmpty();
  req.checkBody("answer","Answer cannot be blank").notEmpty();

  let errors = req.validationErrors();

  if(errors){
    let errMsg = [];
    errors.forEach( (err) => errMsg.push(err.msg) );
    res.status(400).send({errors: errMsg});
  }
  else{
    //Check for a valid deck
    Models.Deck.find({ where: { id: req.params.deckId } })
    .catch( (err) => res.status(500).send(err) )
    .then( (deck) => {
      if(!deck) {
        res.status(404).send("No deck found");
      }
      else {
        next();
      }
    })
  }
}

function findCard (req, res, next) {
  Models.Flipcard.find({
    where: { id: req.params.cardId }
  })
  .catch( (err) => res.status(500).send(err) )
  .then( (card) => {
    if(!card){
      res.status(404).send("No card found");
    }
    else{
      Models.Deck.find({ where: {id: card.deckID } })
      .catch( (err) => res.status(500).send(err) )
      .then( (deck) => {
        card = card.dataValues;
        card.deck = deck.dataValues;
        req.card = card;
        next();
      })
    }
  })
}

router.post('/in/:deckId', validateRequest, (req, res) => {
  let newCard = {
    question: req.body.question,
    answer: req.body.answer,
    deckID: req.params.deckId
  };
  Models.Flipcard.create(newCard)
  .catch( (err) => res.status(500).send("ERROR!") )
  .then( (newCard) => {
    res.status(200).json({card: newCard});
  })
});

router.get('/:cardId', findCard, (req, res) => {
  res.status(200).json({card: req.card});
});

router.put('/:cardId', (req, res) => {
  Models.Flipcard.find({ where: { id: req.params.cardId } })
  .catch( (err) => res.status(500).send(err) )
  .then( (card) => {
    if(!card){
      res.status(404).send("No card found");
    }
    else{
      card.question = req.body.question || card.question;
      card.answer = req.body.answer || card.answer;
      card.save()
      .catch( (err) => res.status(500).send(err) )
      .then( (card) => {
        res.status(200).json({ card: card });
      });
    }
  });
});

router.delete('/:cardId', (req, res) => {
  // Models.Flipcard.destroy({ where: { id: req.params.cardId} })
  // .catch( (err) => res.status(500).send(err) )
  // .then( () => {
  //   res.status(200).send("Card destroyed");
  // });
  Models.Flipcard.find({ where: { id: req.params.cardId} })
  .catch( (err) => res.status(500).send(err) )
  .then( (card) => {
    if(!card){
      res.status(404).send("No card found");
    }
    else{
      card.destroy()
      .catch( (err) => res.status(500).send(err) )
      .then( () => {
        res.status(200).json({card: card});
      })
    }
  })
});

module.exports = router;
