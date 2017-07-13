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
  Models.Flipcard.find({ where: { id: req.params.cardId } })
  .catch( (err) => res.status(500).send(err) )
  .then( (card) => {
    if(!card){
      res.status(404).send("No card found");
    }
    else{
      req.card = card;
      next();
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

router.get('/:cardId', (req, res) => {
  Models.Flipcard.find()
  .catch( (err) => {
    console.log("Error: ",err);
    res.status(500).send(err)
  })
  .then( (data) => {
    console.log("Found something!");
    res.send("Success!")
  })
});

router.put('/:cardId', (req, res) => {

});

router.delete('/:cardId', (req, res) => {

});

module.exports = router;
