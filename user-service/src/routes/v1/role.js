const express = require('express');
const router = express.Router();
const RoleController = require('../../controllers/role.controller');

router.post('/', RoleController.createRole);
router.get('/:id?', RoleController.getRoles);
router.put('/:id', RoleController.updateRole);
router.delete('/:id', RoleController.deleteRole);

module.exports = router;