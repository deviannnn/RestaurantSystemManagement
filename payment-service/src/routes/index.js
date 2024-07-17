const express = require('express');
const router = express.Router();

const PaymentController = require('../controllers/payment-controller');
const PaymentSurchargeController = require('../controllers/payment-surcharge-controller');

router.post('/payments', PaymentController.createPayment);
router.get('/payments/:id?', PaymentController.getPayments);
router.put('/payments/:id', PaymentController.updatePayment);
router.delete('/payments/:id', PaymentController.deletePayment);

router.get('/payments-surcharges/:id?', PaymentSurchargeController.getAllPaymentSurcharges);

// Sử dụng các router khác...

module.exports = router;