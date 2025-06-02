const express = require('express');
const {
    getEmailConfig,
    updateEmailConfig,
    testEmailConfig,
    sendEmail,
    sendBulkEmails,
    getEmailTemplates,
    createEmailTemplate,
    updateEmailTemplate,
    getEmailStats,
    getEmailLogs
} = require('../controller/emailController');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

// Simple routes without complex validation for testing
router.get('/config', authenticateToken, getEmailConfig);
router.put('/config', authenticateToken, updateEmailConfig);
router.post('/test', authenticateToken, testEmailConfig);
router.post('/send', authenticateToken, sendEmail);
router.post('/send-bulk', authenticateToken, sendBulkEmails);
router.get('/templates', authenticateToken, getEmailTemplates);
router.post('/templates', authenticateToken, createEmailTemplate);
router.put('/templates/:templateId', authenticateToken, updateEmailTemplate);
router.get('/stats', authenticateToken, getEmailStats);
router.get('/logs', authenticateToken, getEmailLogs);

// Test route
router.get('/test-route', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Email routes are working!',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
