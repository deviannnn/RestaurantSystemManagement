const express = require('express');
const router = express.Router();

const { PaymentController, SurchargeController, PaymentSurchargeController } = require('../controllers');
const { authenticate, authorize } = require('../middlewares/auth');


router.use(authenticate);

// Payments CRUD
router.post('/payments', authorize(["admin","manager"]), PaymentController.createPayment);
router.get('/payments', authorize(["admin", "manager"]), PaymentController.getAllPayments); // req.query.userId, fromDate, toDate ?
router.get('/payments/:paymentId', authorize(["admin", "manager"]), PaymentController.getPayment); // req.query.include ?
router.put('/payments/:paymentId', authorize(["admin"]), PaymentController.updatePayment);
router.delete('/payments/:paymentId', authorize(["admin"]), PaymentController.deletePayment);

// Payments Business Logic
router.put('/payments/:paymentId/surcharges', authorize(["admin","manager"]), PaymentController.updateSurchargeInPayment);


// Surcharges CRUD
router.post('/surcharges', authorize(["admin"]), SurchargeController.createSurcharge);
router.get('/surcharges/:surchargeId?', authorize(["admin", "manager"]), SurchargeController.getSurcharges);
router.put('/surcharges/:surchargeId?', authorize(["admin"]), SurchargeController.updateSurcharge);
router.delete('/surcharges/:surchargeId?', authorize(["admin"]), SurchargeController.deleteSurcharge);


// Payments_Surcharges CRUD
router.post('/payments-surcharges', authorize(["admin", "manager"]), PaymentSurchargeController.createPaymentSurcharge);
router.get('/payments-surcharges/:psId?', authorize(["admin", "manager"]), PaymentSurchargeController.getPaymentSurcharges);
router.put('/payments-surcharges/:psId?', authorize(["admin", "manager"]), PaymentSurchargeController.updatePaymentSurcharge);
router.delete('/payments-surcharges/:psId?', authorize(["admin", "manager"]), PaymentSurchargeController.deletePaymentSurcharge);

module.exports = router;