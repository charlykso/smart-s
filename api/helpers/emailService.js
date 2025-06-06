const nodemailer = require('nodemailer');
const EmailConfig = require('../model/EmailConfig');
const EmailTemplate = require('../model/EmailTemplate');
const EmailLog = require('../model/EmailLog');
const { v4: uuidv4 } = require('uuid');

class EmailService {
    constructor() {
        this.transporter = null;
        this.config = null;
    }

    // Initialize email service with configuration
    async initialize(schoolId) {
        try {
            this.config = await EmailConfig.findOne({ school: schoolId, isActive: true });
            if (!this.config) {
                throw new Error('Email configuration not found for school');
            }

            this.transporter = nodemailer.createTransporter({
                host: this.config.host,
                port: this.config.port,
                secure: this.config.secure,
                auth: {
                    user: this.config.auth.user,
                    pass: this.config.auth.pass
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            return true;
        } catch (error) {
            console.error('Failed to initialize email service:', error);
            throw error;
        }
    }

    // Send single email
    async sendEmail(emailData) {
        try {
            if (!this.transporter) {
                throw new Error('Email service not initialized');
            }

            const messageId = uuidv4();
            const mailOptions = {
                messageId,
                from: `"${this.config.from.name}" <${this.config.from.email}>`,
                to: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to,
                cc: emailData.cc ? (Array.isArray(emailData.cc) ? emailData.cc.join(', ') : emailData.cc) : undefined,
                bcc: emailData.bcc ? (Array.isArray(emailData.bcc) ? emailData.bcc.join(', ') : emailData.bcc) : undefined,
                subject: emailData.subject,
                html: emailData.htmlContent,
                text: emailData.textContent,
                replyTo: emailData.replyTo || this.config.from.email,
                attachments: emailData.attachments || []
            };

            // Send email
            const result = await this.transporter.sendMail(mailOptions);

            // Log email
            await this.logEmail({
                messageId,
                to: Array.isArray(emailData.to) ? emailData.to : [emailData.to],
                cc: emailData.cc ? (Array.isArray(emailData.cc) ? emailData.cc : [emailData.cc]) : [],
                bcc: emailData.bcc ? (Array.isArray(emailData.bcc) ? emailData.bcc : [emailData.bcc]) : [],
                subject: emailData.subject,
                templateType: emailData.templateType,
                templateId: emailData.templateId,
                status: 'sent',
                user: emailData.userId,
                fee: emailData.feeId,
                payment: emailData.paymentId,
                school: emailData.schoolId,
                metadata: emailData.metadata
            });

            return {
                messageId,
                status: 'sent',
                recipients: Array.isArray(emailData.to) ? emailData.to : [emailData.to],
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Failed to send email:', error);
            
            // Log failed email
            await this.logEmail({
                messageId: uuidv4(),
                to: Array.isArray(emailData.to) ? emailData.to : [emailData.to],
                subject: emailData.subject,
                status: 'failed',
                errorMessage: error.message,
                user: emailData.userId,
                school: emailData.schoolId
            });

            throw error;
        }
    }

    // Send email using template
    async sendTemplateEmail(templateType, recipientEmail, variables, options = {}) {
        try {
            const template = await EmailTemplate.findOne({ 
                type: templateType, 
                isActive: true,
                school: options.schoolId || null
            });

            if (!template) {
                throw new Error(`Email template not found for type: ${templateType}`);
            }

            // Replace variables in template
            let htmlContent = template.htmlContent;
            let textContent = template.textContent;
            let subject = template.subject;

            Object.keys(variables).forEach(key => {
                const placeholder = `{{${key}}}`;
                const value = variables[key] || '';
                htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
                textContent = textContent.replace(new RegExp(placeholder, 'g'), value);
                subject = subject.replace(new RegExp(placeholder, 'g'), value);
            });

            const emailData = {
                to: recipientEmail,
                subject,
                htmlContent,
                textContent,
                templateType,
                templateId: template._id,
                userId: options.userId,
                feeId: options.feeId,
                paymentId: options.paymentId,
                schoolId: options.schoolId,
                metadata: options.metadata
            };

            return await this.sendEmail(emailData);
        } catch (error) {
            console.error('Failed to send template email:', error);
            throw error;
        }
    }

    // Send payment reminder email
    async sendPaymentReminderEmail(data) {
        const templateType = data.isOverdue ? 'payment_overdue' : 'payment_reminder';
        const variables = {
            studentName: data.studentName,
            regNo: data.regNo,
            feeName: data.feeName,
            amount: data.amount,
            formattedAmount: new Intl.NumberFormat('en-NG', {
                style: 'currency',
                currency: 'NGN'
            }).format(data.amount),
            dueDate: new Date(data.dueDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            daysUntilDue: data.daysUntilDue,
            isOverdue: data.isOverdue,
            schoolName: data.schoolName,
            paymentUrl: data.paymentUrl,
            supportEmail: 'support@smart-s.com',
            year: new Date().getFullYear()
        };

        return await this.sendTemplateEmail(templateType, data.recipientEmail, variables, {
            userId: data.userId,
            feeId: data.feeId,
            schoolId: data.schoolId
        });
    }

    // Send payment success email
    async sendPaymentSuccessEmail(data) {
        const variables = {
            studentName: data.studentName,
            regNo: data.regNo,
            feeName: data.feeName,
            amount: data.amount,
            formattedAmount: new Intl.NumberFormat('en-NG', {
                style: 'currency',
                currency: 'NGN'
            }).format(data.amount),
            transactionRef: data.transactionRef,
            paymentDate: new Date(data.paymentDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            paymentMethod: data.paymentMethod,
            schoolName: data.schoolName,
            supportEmail: 'support@smart-s.com',
            year: new Date().getFullYear()
        };

        return await this.sendTemplateEmail('payment_success', data.recipientEmail, variables, {
            userId: data.userId,
            feeId: data.feeId,
            paymentId: data.paymentId,
            schoolId: data.schoolId
        });
    }

    // Send fee approval email
    async sendFeeApprovalEmail(data) {
        const variables = {
            studentName: data.studentName,
            regNo: data.regNo,
            feeName: data.feeName,
            amount: data.amount,
            formattedAmount: new Intl.NumberFormat('en-NG', {
                style: 'currency',
                currency: 'NGN'
            }).format(data.amount),
            termName: data.termName,
            schoolName: data.schoolName,
            paymentUrl: data.paymentUrl,
            supportEmail: 'support@smart-s.com',
            year: new Date().getFullYear()
        };

        return await this.sendTemplateEmail('fee_approved', data.recipientEmail, variables, {
            userId: data.userId,
            feeId: data.feeId,
            schoolId: data.schoolId
        });
    }

    // Test email configuration
    async testConfiguration(testEmail) {
        try {
            if (!this.transporter) {
                throw new Error('Email service not initialized');
            }

            const testMailOptions = {
                from: `"${this.config.from.name}" <${this.config.from.email}>`,
                to: testEmail,
                subject: 'Smart-S Email Configuration Test',
                html: `
                    <h2>Email Configuration Test</h2>
                    <p>This is a test email to verify your Zoho email configuration.</p>
                    <p>If you receive this email, your configuration is working correctly.</p>
                    <p>Sent at: ${new Date().toLocaleString()}</p>
                `,
                text: 'This is a test email to verify your Zoho email configuration.'
            };

            await this.transporter.sendMail(testMailOptions);
            
            // Update test result in config
            await EmailConfig.findByIdAndUpdate(this.config._id, {
                lastTested: new Date(),
                testResult: {
                    success: true,
                    message: 'Test email sent successfully',
                    testedAt: new Date()
                }
            });

            return { success: true, message: 'Test email sent successfully' };
        } catch (error) {
            // Update test result in config
            await EmailConfig.findByIdAndUpdate(this.config._id, {
                lastTested: new Date(),
                testResult: {
                    success: false,
                    message: error.message,
                    testedAt: new Date()
                }
            });

            return { success: false, message: error.message };
        }
    }

    // Log email for tracking
    async logEmail(logData) {
        try {
            const emailLog = new EmailLog(logData);
            await emailLog.save();
            return emailLog;
        } catch (error) {
            console.error('Failed to log email:', error);
        }
    }

    // Get email statistics
    async getEmailStats(schoolId, dateRange = {}) {
        try {
            const matchQuery = { school: schoolId };
            
            if (dateRange.from || dateRange.to) {
                matchQuery.sentAt = {};
                if (dateRange.from) matchQuery.sentAt.$gte = new Date(dateRange.from);
                if (dateRange.to) matchQuery.sentAt.$lte = new Date(dateRange.to);
            }

            const stats = await EmailLog.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: null,
                        totalSent: { $sum: 1 },
                        totalDelivered: { $sum: { $cond: [{ $eq: ['$deliveryStatus', 'delivered'] }, 1, 0] } },
                        totalFailed: { $sum: { $cond: [{ $eq: ['$deliveryStatus', 'failed'] }, 1, 0] } },
                        totalOpened: { $sum: { $cond: [{ $ne: ['$openedAt', null] }, 1, 0] } },
                        totalClicked: { $sum: { $cond: [{ $ne: ['$clickedAt', null] }, 1, 0] } }
                    }
                }
            ]);

            const result = stats[0] || {
                totalSent: 0,
                totalDelivered: 0,
                totalFailed: 0,
                totalOpened: 0,
                totalClicked: 0
            };

            result.deliveryRate = result.totalSent > 0 ? ((result.totalDelivered / result.totalSent) * 100).toFixed(2) : 0;
            result.openRate = result.totalDelivered > 0 ? ((result.totalOpened / result.totalDelivered) * 100).toFixed(2) : 0;
            result.clickRate = result.totalOpened > 0 ? ((result.totalClicked / result.totalOpened) * 100).toFixed(2) : 0;

            return result;
        } catch (error) {
            console.error('Failed to get email stats:', error);
            throw error;
        }
    }
}

module.exports = EmailService;
