const express = require('express');
const router = express.Router();

const RoleController = require('../controllers/role-controller');
const UserController = require('../controllers/user-controller');
const { authenticate, authorize } = require('../middlewares/auth');


// Users Business Logic
router.get('/auth/active', UserController.activateAccount);
router.post('/auth/login', UserController.login);
router.post('/auth/reset-password', UserController.resetPassword);
router.post('/auth/refresh-token', UserController.refreshToken);

router.use(authenticate);

router.post('/users/logout', UserController.logout);
router.post('/users/change-password', UserController.changePassword);
router.post('/users/:userId/mail-active', authorize(["admin", "manager"]), UserController.resendMailActive);


// CRUD users
router.post('/users/register', authorize(["admin", "manager"]), UserController.register);
router.get('/users/:userId?', authorize(["admin", "manager"]), UserController.getUsers);
router.put('/users/:userId', authorize(["admin", "manager"]), UserController.updateUser);
router.delete('/users/:userId', authorize(["admin"]), UserController.deleteUser);


// CRUD role
router.post('/roles', authorize(["admin"]), RoleController.createRole);
router.get('/roles/:roleId?', authorize(["admin"]), RoleController.getRoles);
router.put('/roles/:roleId', authorize(["admin"]), RoleController.updateRole);
router.delete('/roles/:roleId', authorize(["admin"]), RoleController.deleteRole);


module.exports = router;