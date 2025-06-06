const EmailTemplate = require('../model/EmailTemplate');

const defaultTemplates = [
    {
        name: 'Payment Reminder',
        type: 'payment_reminder',
        subject: 'Payment Reminder: {{feeName}} Due {{daysUntilDue}} Day(s)',
        htmlContent: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Payment Reminder</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background-color: #f9fafb; }
                    .payment-details { background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0; }
                    .button { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0; }
                    .footer { background-color: #f3f4f6; padding: 16px; text-align: center; font-size: 14px; color: #6b7280; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>{{schoolName}}</h1>
                        <p>Payment Reminder</p>
                    </div>
                    <div class="content">
                        <h2>Payment Due in {{daysUntilDue}} Day(s)</h2>
                        <p>Dear {{studentName}},</p>
                        <p>This is a friendly reminder that your payment for <strong>{{feeName}}</strong> is due soon.</p>
                        
                        <div class="payment-details">
                            <h3>Payment Details</h3>
                            <p><strong>Fee:</strong> {{feeName}}</p>
                            <p><strong>Amount:</strong> {{formattedAmount}}</p>
                            <p><strong>Due Date:</strong> {{dueDate}}</p>
                            <p><strong>Student ID:</strong> {{regNo}}</p>
                        </div>
                        
                        <a href="{{paymentUrl}}" class="button">Pay Now</a>
                        
                        <p>Please make your payment before the due date to avoid any late fees or penalties.</p>
                        <p>If you have any questions, please contact us at {{supportEmail}}</p>
                    </div>
                    <div class="footer">
                        <p>&copy; {{year}} {{schoolName}}. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        textContent: `
            {{schoolName}} - Payment Reminder
            
            Dear {{studentName}},
            
            This is a friendly reminder that your payment for {{feeName}} is due in {{daysUntilDue}} day(s).
            
            Payment Details:
            - Fee: {{feeName}}
            - Amount: {{formattedAmount}}
            - Due Date: {{dueDate}}
            - Student ID: {{regNo}}
            
            Please make your payment before the due date to avoid any late fees or penalties.
            
            Pay online at: {{paymentUrl}}
            
            If you have any questions, please contact us at {{supportEmail}}
            
            Best regards,
            {{schoolName}}
        `,
        variables: ['studentName', 'regNo', 'feeName', 'formattedAmount', 'dueDate', 'daysUntilDue', 'schoolName', 'paymentUrl', 'supportEmail', 'year']
    },
    {
        name: 'Payment Overdue',
        type: 'payment_overdue',
        subject: 'URGENT: Overdue Fee Payment - {{feeName}}',
        htmlContent: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Payment Overdue</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background-color: #fef2f2; }
                    .alert { background-color: #fee2e2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 16px 0; }
                    .payment-details { background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0; }
                    .button { display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0; }
                    .footer { background-color: #f3f4f6; padding: 16px; text-align: center; font-size: 14px; color: #6b7280; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>{{schoolName}}</h1>
                        <p>URGENT: Payment Overdue</p>
                    </div>
                    <div class="content">
                        <div class="alert">
                            <h2>Payment Overdue Notice</h2>
                            <p>Your payment is overdue. Please make payment immediately.</p>
                        </div>
                        
                        <p>Dear {{studentName}},</p>
                        <p>Your payment for <strong>{{feeName}}</strong> was due on {{dueDate}} and is now overdue. Please make payment immediately to avoid additional penalties.</p>
                        
                        <div class="payment-details">
                            <h3>Payment Details</h3>
                            <p><strong>Fee:</strong> {{feeName}}</p>
                            <p><strong>Amount:</strong> {{formattedAmount}}</p>
                            <p><strong>Original Due Date:</strong> {{dueDate}}</p>
                            <p><strong>Student ID:</strong> {{regNo}}</p>
                        </div>
                        
                        <a href="{{paymentUrl}}" class="button">Pay Now to Avoid Penalties</a>
                        
                        <p><strong>Important:</strong> Late payment may result in additional fees or restrictions on school services.</p>
                        <p>If you have already made this payment or need assistance, please contact us immediately at {{supportEmail}}</p>
                    </div>
                    <div class="footer">
                        <p>&copy; {{year}} {{schoolName}}. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        textContent: `
            {{schoolName}} - URGENT: Payment Overdue
            
            Dear {{studentName}},
            
            Your payment for {{feeName}} was due on {{dueDate}} and is now overdue.
            Please make payment immediately to avoid additional penalties.
            
            Payment Details:
            - Fee: {{feeName}}
            - Amount: {{formattedAmount}}
            - Original Due Date: {{dueDate}}
            - Student ID: {{regNo}}
            
            IMPORTANT: Late payment may result in additional fees or restrictions on school services.
            
            Pay online immediately at: {{paymentUrl}}
            
            If you have already made this payment or need assistance, please contact us immediately at {{supportEmail}}
            
            Best regards,
            {{schoolName}}
        `,
        variables: ['studentName', 'regNo', 'feeName', 'formattedAmount', 'dueDate', 'schoolName', 'paymentUrl', 'supportEmail', 'year']
    },
    {
        name: 'Payment Success',
        type: 'payment_success',
        subject: 'Payment Confirmation - {{feeName}}',
        htmlContent: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Payment Confirmation</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #059669; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background-color: #f0fdf4; }
                    .success { background-color: #dcfce7; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 16px 0; text-align: center; }
                    .receipt { background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0; }
                    .footer { background-color: #f3f4f6; padding: 16px; text-align: center; font-size: 14px; color: #6b7280; }
                    .checkmark { font-size: 48px; color: #059669; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>{{schoolName}}</h1>
                        <p>Payment Confirmation</p>
                    </div>
                    <div class="content">
                        <div class="success">
                            <div class="checkmark">✓</div>
                            <h2>Payment Successful!</h2>
                            <p>Your payment has been processed successfully.</p>
                        </div>
                        
                        <p>Dear {{studentName}},</p>
                        <p>Thank you for your payment. We have successfully received your payment for <strong>{{feeName}}</strong>.</p>
                        
                        <div class="receipt">
                            <h3>Payment Receipt</h3>
                            <p><strong>Fee:</strong> {{feeName}}</p>
                            <p><strong>Amount Paid:</strong> {{formattedAmount}}</p>
                            <p><strong>Payment Date:</strong> {{paymentDate}}</p>
                            <p><strong>Payment Method:</strong> {{paymentMethod}}</p>
                            <p><strong>Transaction Reference:</strong> {{transactionRef}}</p>
                            <p><strong>Student ID:</strong> {{regNo}}</p>
                        </div>
                        
                        <p>Please keep this email as your payment receipt. You can also access your payment history through your student portal.</p>
                        <p>If you have any questions about this payment, please contact us at {{supportEmail}}</p>
                    </div>
                    <div class="footer">
                        <p>&copy; {{year}} {{schoolName}}. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        textContent: `
            {{schoolName}} - Payment Confirmation
            
            Dear {{studentName}},
            
            Payment Successful!
            
            Thank you for your payment. We have successfully received your payment for {{feeName}}.
            
            Payment Receipt:
            - Fee: {{feeName}}
            - Amount Paid: {{formattedAmount}}
            - Payment Date: {{paymentDate}}
            - Payment Method: {{paymentMethod}}
            - Transaction Reference: {{transactionRef}}
            - Student ID: {{regNo}}
            
            Please keep this email as your payment receipt. You can also access your payment history through your student portal.
            
            If you have any questions about this payment, please contact us at {{supportEmail}}
            
            Best regards,
            {{schoolName}}
        `,
        variables: ['studentName', 'regNo', 'feeName', 'formattedAmount', 'transactionRef', 'paymentDate', 'paymentMethod', 'schoolName', 'supportEmail', 'year']
    },
    {
        name: 'Fee Approved',
        type: 'fee_approved',
        subject: 'New Fee Available: {{feeName}}',
        htmlContent: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>New Fee Available</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #7c3aed; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background-color: #faf5ff; }
                    .fee-details { background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0; }
                    .button { display: inline-block; background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0; }
                    .footer { background-color: #f3f4f6; padding: 16px; text-align: center; font-size: 14px; color: #6b7280; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>{{schoolName}}</h1>
                        <p>New Fee Available</p>
                    </div>
                    <div class="content">
                        <h2>New Fee Available for Payment</h2>
                        
                        <p>Dear {{studentName}},</p>
                        <p>A new fee <strong>{{feeName}}</strong> has been approved and is now available for payment.</p>
                        
                        <div class="fee-details">
                            <h3>Fee Details</h3>
                            <p><strong>Fee Name:</strong> {{feeName}}</p>
                            <p><strong>Amount:</strong> {{formattedAmount}}</p>
                            <p><strong>Term:</strong> {{termName}}</p>
                            <p><strong>Student ID:</strong> {{regNo}}</p>
                        </div>
                        
                        <a href="{{paymentUrl}}" class="button">View and Pay Fee</a>
                        
                        <p>You can now proceed to make payment for this fee through your student portal.</p>
                        <p>If you have any questions about this fee, please contact us at {{supportEmail}}</p>
                    </div>
                    <div class="footer">
                        <p>&copy; {{year}} {{schoolName}}. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        textContent: `
            {{schoolName}} - New Fee Available
            
            Dear {{studentName}},
            
            A new fee "{{feeName}}" has been approved and is now available for payment.
            
            Fee Details:
            - Fee Name: {{feeName}}
            - Amount: {{formattedAmount}}
            - Term: {{termName}}
            - Student ID: {{regNo}}
            
            You can now proceed to make payment for this fee through your student portal.
            
            Pay online at: {{paymentUrl}}
            
            If you have any questions about this fee, please contact us at {{supportEmail}}
            
            Best regards,
            {{schoolName}}
        `,
        variables: ['studentName', 'regNo', 'feeName', 'formattedAmount', 'termName', 'schoolName', 'paymentUrl', 'supportEmail', 'year']
    }
];

const createDefaultTemplates = async () => {
    try {
        for (const template of defaultTemplates) {
            const existingTemplate = await EmailTemplate.findOne({ 
                name: template.name, 
                type: template.type 
            });
            
            if (!existingTemplate) {
                await EmailTemplate.create(template);
                console.log(`Created default email template: ${template.name}`);
            }
        }
        console.log('Default email templates initialization completed');
    } catch (error) {
        console.error('Error creating default email templates:', error);
    }
};

module.exports = {
    defaultTemplates,
    createDefaultTemplates
};
