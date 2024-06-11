const express = require('express');
const router = express.Router();
const IEController = require('../../controllers/incidental-expense.controller');

router.post('/', IEController.createIE);
router.get('/:id?', IEController.getIEs);
router.put('/:id', IEController.updateIE);
router.delete('/:id', IEController.deleteIE);

module.exports = router;