var express = require('express');
var router = express.Router();
var db = require('../models/index');
const { register, login, logout, verifyAccount } = require('../services/userService');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/verifyAccount', verifyAccount);

/* GET home page. */
router.get('/', async (req, res, next) => {
  let data = await db.User.findAll();
  res.status(200).json(data);
});

module.exports = router;
