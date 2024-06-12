var express = require('express');
var router = express.Router();

const UserController = require('../../controllers/user.controller');

router.post('/register', UserController.register);

router.post('/login', UserController.login);

router.get('/:id?', UserController.getUser);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

module.exports = router;