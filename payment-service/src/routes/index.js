const express = require('express');
const router = express.Router();

const PaymentController = require('../controllers/payment-controller');
const PaymentSurchargeController = require('../controllers/payment-surcharge-controller');

router.post('/v1/payments', PaymentController.createPayment);
router.get('/v1/payments/:id?', PaymentController.getPayments);
router.put('/v1/payments/:id', PaymentController.updatePayment);
router.delete('/v1/payments/:id', PaymentController.deletePayment);

router.get('/v1/payments-surcharges/:id?', PaymentSurchargeController.getAllPaymentSurcharges);

// Sử dụng các router khác...

module.exports = router;