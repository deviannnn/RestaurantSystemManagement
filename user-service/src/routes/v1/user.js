var express = require('express');
var router = express.Router();
const auth = require('../../middlewares/auth');

const UserController = require('../../controllers/user.controller');

router.get('/active', UserController.verifyAccount);

// router.use(auth.checkRevokedToken);

router.post('/login', UserController.login);

// router.use(auth.authenticate);

router.post('/refresh-token', UserController.refreshToken);

router.post('/resetpassword', UserController.resetPassword);

router.post('/:id/changepassword', UserController.changePassword);

router.post('/logout', UserController.logout);

// router.use(auth.isAdmin);
router.post('/register', UserController.register);
router.post('/resend-mail-active', UserController.resendMailActive);

router.get('/:id?', UserController.getUser);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

module.exports = router;