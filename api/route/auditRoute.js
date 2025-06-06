const auditController = require('../controller/audit_view');
const express = require('express');
const router = express.Router();

router.get('/user/:user_id', auditController.getAllPaymentsByUser);
router.get('/user/:user_id/term/:term_id', auditController.getAllPaymentByUserInTerm);
router.get('/user/:user_id/session/:session_id', auditController.getAllPaymentByUserInSession);

module.exports = router;
// This code defines a route for fetching all payments made by a specific user.