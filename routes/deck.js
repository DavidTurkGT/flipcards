const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send("Deck router!");
});

module.exports = router;
