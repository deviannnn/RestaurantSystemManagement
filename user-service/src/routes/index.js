const express = require('express');
const router = express.Router();

const RoleController = require('../controllers/role.controller');
const UserController = require('../controllers/user.controller');

const auth = require('../middlewares/auth');

router.get('/v1/users/active', UserController.verifyAccount);
router.post('/v1/users/register', UserController.register);

// router.use(auth.checkRevokedToken);

router.post('/v1/users/login', UserController.login);

router.use(auth.checkRevokedToken);
router.use(auth.authenticate);

// router.use(auth.isManager);
// router.use(auth.isCashier);
router.post('/v1/users/refresh-token', UserController.refreshToken);

router.post('/v1/users/resetpassword', UserController.resetPassword);

router.post('/v1/users/:id/changepassword', UserController.changePassword);

router.post('/v1/users/logout', UserController.logout);

// router.use(auth.isAdmin);
router.post('/v1/users/resend-mail-active', UserController.resendMailActive);

//CRUD users
router.post('/v1/users/register', UserController.register);
router.get('/v1/users/:id?', UserController.getUser);
router.put('/v1/users/:id', UserController.updateUser);
router.delete('/v1/users/:id', UserController.deleteUser);

//CRUD role
router.post('/v1/role', RoleController.createRole);
router.get('/v1/role/:id?', RoleController.getRoles);
router.put('/v1/role/:id', RoleController.updateRole);
router.delete('/v1/role/:id', RoleController.deleteRole);
// Sử dụng các router khác...

module.exports = router;