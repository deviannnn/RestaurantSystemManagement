const express = require('express');
const router = express.Router();

const RoleController = require('../controllers/role-controller');
const UserController = require('../controllers/user-controller');

const auth = require('../middlewares/auth');

router.get('/auth/active', UserController.verifyAccount);
router.post('/auth/login', UserController.login);


//CRUD users
router.post('/users/register', UserController.register);
router.get('/users/:id?', UserController.getUser);
router.put('/users/:id', UserController.updateUser);
router.delete('/users/:id', UserController.deleteUser);

router.post('/users/register', UserController.register);
router.post('/users/refresh-token', UserController.refreshToken);
router.post('/users/resetpassword', UserController.resetPassword);
router.post('/users/:id/changepassword', UserController.changePassword);
router.post('/users/logout', UserController.logout);
router.post('/users/resend-mail-active', UserController.resendMailActive);

//CRUD role
router.post('/roles', RoleController.createRole);
router.get('/roles/:roleId?', RoleController.getRoles);
router.put('/roles/:roleId', RoleController.updateRole);
router.delete('/roles/:roleId', RoleController.deleteRole);

module.exports = router;