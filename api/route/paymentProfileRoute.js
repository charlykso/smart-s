const express = require('express');
const paymentProfileController = require('../controller/paymentProfile_view');
const router = express.Router();

router.get('/all', paymentProfileController.getAllPaymentProfiles);
router.get('/:id', paymentProfileController.getPaymentProfile);
router.get('/all/:school_id', paymentProfileController.getAllPaymentProfilesForSchool);
router.post('/create', paymentProfileController.createPaymentProfile);
router.put('/update/:id', paymentProfileController.updatePaymentProfile);
router.delete('/delete/:id', paymentProfileController.deletePaymentProfile);

module.exports = router;