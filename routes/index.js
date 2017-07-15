const express = require('express');
const router = express.Router();
const userRouter = require("./users");
const deckRouter = require('./deck');
const cardRouter = require('./cards');

router.use("/users", userRouter);
router.use("/deck", deckRouter);
router.use('/cards', cardRouter);

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/home", (req, res) => {
  res.render("home");
});

router.get("/quiz", (req, res) => {
  res.render("quiz");
})

module.exports = router;
