const express = require('express')
const { body, param, query } = require('express-validator')
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
  getEmailLogs,
} = require('../controller/emailController')
const authenticateToken = require('../middleware/authenticateToken')
const verifyRoles = require('../middleware/verifyRoles')
const roleList = require('../helpers/roleList')

const router = express.Router()

// Email configuration routes
router.get(
  '/config',
  authenticateToken,
  verifyRoles(roleList.Admin, roleList.ICT_administrator),
  getEmailConfig
)

router.put(
  '/config',
  authenticateToken,
  verifyRoles(roleList.Admin, roleList.ICT_administrator),
  [
    body('provider')
      .isIn(['zoho', 'gmail', 'outlook'])
      .withMessage('Invalid email provider'),
    body('host').notEmpty().withMessage('SMTP host is required'),
    body('port')
      .isInt({ min: 1, max: 65535 })
      .withMessage('Valid port number is required'),
    body('secure').isBoolean().withMessage('Secure must be a boolean'),
    body('auth.user').isEmail().withMessage('Valid email is required'),
    body('auth.pass').notEmpty().withMessage('Password is required'),
    body('from.name').notEmpty().withMessage('Sender name is required'),
    body('from.email').isEmail().withMessage('Valid sender email is required'),
  ],
  updateEmailConfig
)

router.post(
  '/test',
  authenticateToken,
  verifyRoles(roleList.Admin, roleList.ICT_administrator),
  [body('testEmail').isEmail().withMessage('Valid test email is required')],
  testEmailConfig
)

// Email sending routes
router.post(
  '/send',
  authenticateToken,
  [
    body('to').notEmpty().withMessage('Recipient email is required'),
    body('subject').notEmpty().withMessage('Subject is required'),
    body('htmlContent').optional().isString(),
    body('textContent').optional().isString(),
    body('templateId').optional().isMongoId(),
  ],
  sendEmail
)

router.post(
  '/send-bulk',
  authenticateToken,
  verifyRoles(
    roleList.Admin,
    roleList.ICT_administrator,
    roleList.Principal,
    roleList.Headteacher
  ),
  [
    body('emails').isArray().withMessage('Emails must be an array'),
    body('emails.*.to').notEmpty().withMessage('Recipient email is required'),
    body('emails.*.subject').notEmpty().withMessage('Subject is required'),
  ],
  sendBulkEmails
)

// Email template routes
router.get('/templates', authenticateToken, getEmailTemplates)

router.post(
  '/templates',
  authenticateToken,
  verifyRoles(roleList.Admin, roleList.ICT_administrator),
  [
    body('name').notEmpty().withMessage('Template name is required'),
    body('type')
      .isIn([
        'payment_reminder',
        'payment_overdue',
        'payment_success',
        'payment_failed',
        'fee_approved',
        'system_notification',
      ])
      .withMessage('Invalid template type'),
    body('subject').notEmpty().withMessage('Subject is required'),
    body('htmlContent').notEmpty().withMessage('HTML content is required'),
    body('textContent').notEmpty().withMessage('Text content is required'),
    body('variables').optional().isArray(),
  ],
  createEmailTemplate
)

router.put(
  '/templates/:templateId',
  authenticateToken,
  verifyRoles(roleList.Admin, roleList.ICT_administrator),
  [
    param('templateId')
      .isMongoId()
      .withMessage('Valid template ID is required'),
  ],
  updateEmailTemplate
)

// Email statistics and logs
router.get(
  '/stats',
  authenticateToken,
  verifyRoles(
    roleList.Admin,
    roleList.ICT_administrator,
    roleList.Principal,
    roleList.Headteacher
  ),
  [
    query('from')
      .optional()
      .isISO8601()
      .withMessage('Valid from date is required'),
    query('to').optional().isISO8601().withMessage('Valid to date is required'),
  ],
  getEmailStats
)

router.get(
  '/logs',
  authenticateToken,
  verifyRoles(roleList.Admin, roleList.ICT_administrator),
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Valid page number is required'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Valid limit is required'),
    query('status')
      .optional()
      .isIn(['sent', 'delivered', 'failed', 'bounced', 'opened', 'clicked']),
    query('templateType')
      .optional()
      .isIn([
        'payment_reminder',
        'payment_overdue',
        'payment_success',
        'payment_failed',
        'fee_approved',
        'system_notification',
      ]),
  ],
  getEmailLogs
)

module.exports = router
