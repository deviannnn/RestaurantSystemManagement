const express = require('express');
const router = express.Router();

const { PaymentController, SurchargeController, PaymentSurchargeController } = require('../controllers');
const { extractUserFromHeaders, authorize } = require('../middlewares/auth');


router.use(extractUserFromHeaders);

// Payments CRUD
router.post('/payments', authorize(["manager"]), PaymentController.createPayment);
router.get('/payments/:paymentId?', authorize(["admin", "manager"]), PaymentController.getPayments);
router.put('/payments/:paymentId', authorize(["admin"]), PaymentController.updatePayment);
router.delete('/payments/:paymentId', authorize(["admin"]), PaymentController.deletePayment);

// Payments Business Logic
router.put('/payments/:paymentId/surcharges', authorize(["manager"]), PaymentController.updateSurchargeInPayment);


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