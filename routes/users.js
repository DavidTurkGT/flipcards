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
          res.status(400).json({ errors: ["Username already taken"] });
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
};

router.post('/',
  validateNewUser({username: true,password: true}),
  (req, res) => {
    console.log("Creating a new user!");
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
      req.session.userID = user.id;
      req.session.username = user.username;
      res.setHeader('Content-Type','application/json');
      res.status(200).json({ user: user });
    })
  }
);

router.post('/login', (req, res) => {
  //Find the user
  Models.User.find({
    where: {
      username: req.body.username
    }
  })
  .catch( (err) => res.status(500).send(err) )
  .then( (user) => {
    if(!user){
      res.status(401).send("Invalid username/password");
    }
    else{
      //Valid username; check password
      if( isPasswordCorrect(user, req.body.password) ){
        res.status(200).send("Log in!");
      }
      else{
        res.status(401).send("Invalid username/password");
      }
    }
  })
});

router.get('/get/me', (req, res) => {
  console.log("Session: ", req.session);
  if(req.session.userID){
    res.status(200).json(req.session);
  }
  else{
    res.status(404).send("No saved session");
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy( () => {
    res.redirect("/");
  })
})

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

function isPasswordCorrect(user, passwordAttempt) {
  let savedHash = user.passwordHash;
  let savedSalt = user.passwordSalt;
  let savedIterations = user.passwordIterations;

  let hash = crypto.pbkdf2Sync(passwordAttempt, savedSalt, savedIterations, config2.keylen, config2.digest);

  var hashedPassword = hash.toString('base64');
  return savedHash === hashedPassword;
}
