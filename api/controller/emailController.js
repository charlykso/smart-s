const EmailConfig = require('../model/EmailConfig');
const EmailTemplate = require('../model/EmailTemplate');
const EmailLog = require('../model/EmailLog');
const EmailService = require('../helpers/emailService');
const { validationResult } = require('express-validator');

// Get email configuration
const getEmailConfig = async (req, res) => {
    try {
        const schoolId = req.user.school || req.body.school_id;
        
        const config = await EmailConfig.findOne({ school: schoolId }).populate('school', 'name');
        
        if (!config) {
            return res.status(404).json({
                success: false,
                message: 'Email configuration not found'
            });
        }

        // Don't send password in response
        const configResponse = config.toObject();
        delete configResponse.auth.pass;

        res.status(200).json({
            success: true,
            data: configResponse
        });
    } catch (error) {
        console.error('Get email config error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get email configuration',
            error: error.message
        });
    }
};

// Update email configuration
const updateEmailConfig = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const schoolId = req.user.school || req.body.school_id;
        const updateData = req.body;

        let config = await EmailConfig.findOne({ school: schoolId });
        
        if (!config) {
            // Create new configuration
            config = new EmailConfig({
                ...updateData,
                school: schoolId
            });
        } else {
            // Update existing configuration
            Object.assign(config, updateData);
        }

        await config.save();

        // Don't send password in response
        const configResponse = config.toObject();
        delete configResponse.auth.pass;

        res.status(200).json({
            success: true,
            message: 'Email configuration updated successfully',
            data: configResponse
        });
    } catch (error) {
        console.error('Update email config error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update email configuration',
            error: error.message
        });
    }
};

// Test email configuration
const testEmailConfig = async (req, res) => {
    try {
        const { testEmail } = req.body;
        const schoolId = req.user.school || req.body.school_id;

        if (!testEmail) {
            return res.status(400).json({
                success: false,
                message: 'Test email address is required'
            });
        }

        const emailService = new EmailService();
        await emailService.initialize(schoolId);
        
        const result = await emailService.testConfiguration(testEmail);

        res.status(200).json({
            success: result.success,
            message: result.message
        });
    } catch (error) {
        console.error('Test email config error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to test email configuration',
            error: error.message
        });
    }
};

// Send email
const sendEmail = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const schoolId = req.user.school || req.body.school_id;
        const emailData = {
            ...req.body,
            schoolId,
            userId: req.user._id
        };

        const emailService = new EmailService();
        await emailService.initialize(schoolId);
        
        const result = await emailService.sendEmail(emailData);

        res.status(200).json({
            success: true,
            message: 'Email sent successfully',
            data: result
        });
    } catch (error) {
        console.error('Send email error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send email',
            error: error.message
        });
    }
};

// Send bulk emails
const sendBulkEmails = async (req, res) => {
    try {
        const { emails } = req.body;
        const schoolId = req.user.school || req.body.school_id;

        if (!emails || !Array.isArray(emails)) {
            return res.status(400).json({
                success: false,
                message: 'Emails array is required'
            });
        }

        const emailService = new EmailService();
        await emailService.initialize(schoolId);
        
        const results = [];
        const errors = [];

        for (const emailData of emails) {
            try {
                const result = await emailService.sendEmail({
                    ...emailData,
                    schoolId,
                    userId: req.user._id
                });
                results.push(result);
            } catch (error) {
                errors.push({
                    email: emailData.to,
                    error: error.message
                });
            }
        }

        res.status(200).json({
            success: true,
            message: `Sent ${results.length} emails successfully`,
            data: {
                sent: results.length,
                failed: errors.length,
                results,
                errors
            }
        });
    } catch (error) {
        console.error('Send bulk emails error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send bulk emails',
            error: error.message
        });
    }
};

// Get email templates
const getEmailTemplates = async (req, res) => {
    try {
        const schoolId = req.user.school || req.body.school_id;
        
        const templates = await EmailTemplate.find({
            $or: [
                { school: schoolId },
                { school: null } // Global templates
            ],
            isActive: true
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: templates
        });
    } catch (error) {
        console.error('Get email templates error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get email templates',
            error: error.message
        });
    }
};

// Create email template
const createEmailTemplate = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const schoolId = req.user.school || req.body.school_id;
        const templateData = {
            ...req.body,
            school: schoolId
        };

        const template = new EmailTemplate(templateData);
        await template.save();

        res.status(201).json({
            success: true,
            message: 'Email template created successfully',
            data: template
        });
    } catch (error) {
        console.error('Create email template error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create email template',
            error: error.message
        });
    }
};

// Update email template
const updateEmailTemplate = async (req, res) => {
    try {
        const { templateId } = req.params;
        const schoolId = req.user.school || req.body.school_id;

        const template = await EmailTemplate.findOne({
            _id: templateId,
            $or: [
                { school: schoolId },
                { school: null }
            ]
        });

        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Email template not found'
            });
        }

        Object.assign(template, req.body);
        await template.save();

        res.status(200).json({
            success: true,
            message: 'Email template updated successfully',
            data: template
        });
    } catch (error) {
        console.error('Update email template error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update email template',
            error: error.message
        });
    }
};

// Get email statistics
const getEmailStats = async (req, res) => {
    try {
        const schoolId = req.user.school || req.body.school_id;
        const { from, to } = req.query;

        const dateRange = {};
        if (from) dateRange.from = from;
        if (to) dateRange.to = to;

        const emailService = new EmailService();
        const stats = await emailService.getEmailStats(schoolId, dateRange);

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Get email stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get email statistics',
            error: error.message
        });
    }
};

// Get email logs
const getEmailLogs = async (req, res) => {
    try {
        const schoolId = req.user.school || req.body.school_id;
        const { page = 1, limit = 20, status, templateType } = req.query;

        const query = { school: schoolId };
        if (status) query.status = status;
        if (templateType) query.templateType = templateType;

        const logs = await EmailLog.find(query)
            .populate('user', 'firstname lastname email regNo')
            .populate('fee', 'name amount type')
            .populate('payment', 'amount trx_ref status')
            .sort({ sentAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await EmailLog.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                logs,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get email logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get email logs',
            error: error.message
        });
    }
};

module.exports = {
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
};
