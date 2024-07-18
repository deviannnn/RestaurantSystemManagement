const express = require('express');
const router = express.Router();

const { PaymentController, SurchargeController, PaymentSurchargeController } = require('../controllers');

// Payments CRUD
router.post('/payments', PaymentController.createPayment);
router.get('/payments/:paymentId?', PaymentController.getPayments);
router.put('/payments/:paymentId', PaymentController.updatePayment);
router.delete('/payments/:paymentId', PaymentController.deletePayment);

// Payments Business Logic
router.put('/payments/:paymentId/surcharges', PaymentController.updateSurchargeInPayment);


// Surcharges CRUD
router.post('/surcharges', SurchargeController.createSurcharge);
router.get('/surcharges/:surchargeId?', SurchargeController.getSurcharges);
router.put('/surcharges/:surchargeId?', SurchargeController.updateSurcharge);
router.delete('/surcharges/:surchargeId?', SurchargeController.deleteSurcharge);


// Payments_Surcharges CRUD
router.post('/payments-surcharges', PaymentSurchargeController.createPaymentSurcharge);
router.get('/payments-surcharges/:psId?', PaymentSurchargeController.getPaymentSurcharges);
router.put('/payments-surcharges/:psId?', PaymentSurchargeController.updatePaymentSurcharge);
router.delete('/payments-surcharges/:psId?', PaymentSurchargeController.deletePaymentSurcharge);

module.exports = router;