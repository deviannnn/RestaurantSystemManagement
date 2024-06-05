var express = require('express');
var router = express.Router();

var db = require('../models/index');

/* GET home page. */
router.get('/', async (req, res, next) => {
  let data = await db.User.findAll();
  res.status(200).json(data);
});

module.exports = router;
