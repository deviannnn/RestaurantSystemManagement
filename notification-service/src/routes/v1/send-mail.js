var express = require('express');
var router = express.Router();

const NotificationController = require('../../controllers/notification.controller');

router.use(NotificationController.authenticate);

module.exports = router;