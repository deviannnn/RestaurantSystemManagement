const express = require('express');
const router = express.Router();
const PaymentController = require('../../controllers/payment.controller');

router.post('/', PaymentController.createPayment);
router.get('/:id?', PaymentController.getPayments);
router.put('/:id', PaymentController.updatePayment);
router.delete('/:id', PaymentController.deletePayment);

module.exports = router;