const express = require('express');
const router = express.Router();

router.use('/v1/send-mail', require('./v1/send-mail'));

module.exports = router;