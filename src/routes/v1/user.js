var express = require('express');
var router = express.Router();
const auth = require('../../middlewares/auth');

const UserController = require('../../controllers/user.controller');

router.post('/register', UserController.register);

router.post('/login', UserController.login);

router.post('/refresh-token', UserController.refreshToken);

router.use(auth.authenticate);

//router.use(auth.checkRevokedToken);

//router.post('/logout', UserController.logout);
// router.use(auth.checkRevokedToken, auth.isLoggedIn);



router.get('/:id?', UserController.getUser);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

module.exports = router;