const express = require('express');
const router = express.Router();
const Models = require('../models');
const crypto = require('crypto');

function validateNewUser (options) {
  let opts = options || {}

  return (req, res, next) => {
    if(opts.username){
      req.checkBody("username","No username provided").notEmpty();
    }
    if(opts.password){
      req.checkBody("password","No password provided").notEmpty();
    }

    let errors = req.validationErrors();
    if(errors){
      let errMsg = [];
      errors.forEach( (err) => errMsg.push(err) );
      res.setHeader('Content-Type','application/json');
      res.status(400).json({ errors: errMsg });
    }
    else{
      Models.User.find({
        where: {
          username: req.body.username
        }
      })
      .catch( (err) => res.status(500).send("Internal server error: " + err) )
      .then( (user) => {
        if(user){
          res.setHeader('Content-Type','application/json');
          res.status(400).json({ errors: "Username already taken" });
        }
        else{
          next();
        }
      })
    }
  }
};

function findUser (req, res, next) {
  Models.User.find({ where: { id: req.params.userId } })
  .catch( (err) => res.status(500).send(err) )
  .then( (user) => {
    if(!user){
      res.status(404).send("No user found");
    }
    else{
      req.user = user;
      next();
    }
  })
}

router.post('/',
  validateNewUser({username: true,password: true}),
  (req, res) => {
    let newUser = {
      username: req.body.username,
    };
    let password = hashPassword(req.body.password);
    newUser.passwordSalt = password.salt;
    newUser.passwordIterations = password.iterations;
    newUser.passwordHash = password.hash;
    Models.User.create(newUser)
    .catch( (err) => res.status(500).send("Internal server error: "+err) )
    .then( (newUser) => {
      res.setHeader('Content-Type','application/json');
      res.status(200).json({newUser: newUser});
    })
  }
);

router.get('/:userId', findUser, (req, res) =>{
  res.setHeader('Content-Type','application/json');
  res.status(200).json({user: req.user});
});

router.put('/:userId',
  validateNewUser({username: true}),
  findUser,
  (req, res) => {
    let user = req.user;
    user.username = req.body.username;
    user.save()
    .catch( (err) => res.status(500).send(err) )
    .then( (user) => {
      res.setHeader('Content-Type','application/json');
      res.status(200).json({ user: user });
    })
  }
);

router.delete('/:userId',
  findUser,
  (req, res) => {
    //TODO: Can't delete users until you can delete decks
  }
);

module.exports = router;

//Hashing a password
var config = {
    salt: function(length){
    return crypto.randomBytes(Math.ceil(32 * 3 / 4)).toString('base64').slice(0, length);
    },
    iterations: 20000,
    keylen: 512,
    digest: 'sha512'
};

function hashPassword(passwordinput){
    var salt = config.salt(32);
    var iterations = config.iterations;
    var hash = crypto.pbkdf2Sync(passwordinput, salt, iterations, config.keylen, config.digest);
    var hashedPassword = hash.toString('base64');

    return {salt: salt, hash: hashedPassword, iterations: iterations};
};

let config2 = {
  keylen: 512,
  digest: 'sha512'
};

function isPasswordCorrect(passwordAttempt) {
  let savedHash = 'saved-hash-in-db';
  let savedSalt = 'saved-salt-in-db';
  let savedIterations = 'saved-iterations-in-db';

  let hash = crypto.pbkdf2Sync(passwordAttempt, savedSalt, savedIterations, config2.keylen, config2.digest);

  var hashPassword = hash.toString('base64');
  return savedHash === hashedPassword;
}
