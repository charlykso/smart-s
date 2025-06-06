import { ApiService } from './api';
import { API_ENDPOINTS } from '../constants';
import type { Notification } from './notificationService';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  type: 'payment_reminder' | 'payment_success' | 'payment_failed' | 'fee_approved' | 'system_notification';
}

export interface EmailConfig {
  provider: 'zoho';
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: {
    name: string;
    email: string;
  };
}

export interface SendEmailRequest {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  htmlContent?: string;
  textContent?: string;
  templateId?: string;
  templateVariables?: Record<string, any>;
  attachments?: {
    filename: string;
    content: string | Buffer;
    contentType?: string;
    encoding?: string;
  }[];
  priority?: 'high' | 'normal' | 'low';
  replyTo?: string;
}

export interface EmailResponse {
  messageId: string;
  status: 'sent' | 'queued' | 'failed';
  recipients: {
    email: string;
    status: 'accepted' | 'rejected';
    error?: string;
  }[];
  timestamp: string;
}

export interface EmailStats {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  totalOpened: number;
  totalClicked: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
}

export class EmailService {
  // Send single email
  static async sendEmail(emailData: SendEmailRequest): Promise<EmailResponse> {
    const response = await ApiService.post<EmailResponse>('/email/send', emailData);
    if (!response) {
      throw new Error('Failed to send email');
    }
    return response;
  }

  // Send bulk emails
  static async sendBulkEmails(emails: SendEmailRequest[]): Promise<EmailResponse[]> {
    const response = await ApiService.post<EmailResponse[]>('/email/send-bulk', { emails });
    if (!response) {
      throw new Error('Failed to send bulk emails');
    }
    return response;
  }

  // Send notification email
  static async sendNotificationEmail(
    notification: Notification,
    recipientEmail: string,
    userDetails?: {
      firstName: string;
      lastName: string;
      regNo?: string;
    }
  ): Promise<EmailResponse> {
    const emailData: SendEmailRequest = {
      to: recipientEmail,
      subject: this.getEmailSubject(notification),
      templateId: this.getTemplateId(notification.type),
      templateVariables: {
        firstName: userDetails?.firstName || 'Student',
        lastName: userDetails?.lastName || '',
        regNo: userDetails?.regNo || '',
        notificationTitle: notification.title,
        notificationMessage: notification.message,
        amount: notification.metadata?.amount,
        dueDate: notification.metadata?.dueDate,
        feeId: notification.metadata?.feeId,
        actionUrl: notification.actionUrl,
        timestamp: notification.timestamp,
        schoolName: 'Smart-S School',
        supportEmail: 'support@smart-s.com',
        year: new Date().getFullYear(),
      },
    };

    return this.sendEmail(emailData);
  }

  // Send payment reminder email
  static async sendPaymentReminderEmail(data: {
    recipientEmail: string;
    studentName: string;
    regNo: string;
    feeName: string;
    amount: number;
    dueDate: string;
    daysUntilDue: number;
    isOverdue: boolean;
    schoolName: string;
    paymentUrl: string;
  }): Promise<EmailResponse> {
    const templateId = data.isOverdue ? 'payment_overdue' : 'payment_reminder';
    
    const emailData: SendEmailRequest = {
      to: data.recipientEmail,
      subject: data.isOverdue 
        ? `URGENT: Overdue Fee Payment - ${data.feeName}`
        : `Payment Reminder: ${data.feeName} Due ${data.daysUntilDue === 0 ? 'Today' : `in ${data.daysUntilDue} day(s)`}`,
      templateId,
      templateVariables: {
        studentName: data.studentName,
        regNo: data.regNo,
        feeName: data.feeName,
        amount: data.amount,
        formattedAmount: new Intl.NumberFormat('en-NG', {
          style: 'currency',
          currency: 'NGN',
        }).format(data.amount),
        dueDate: new Date(data.dueDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        daysUntilDue: data.daysUntilDue,
        isOverdue: data.isOverdue,
        schoolName: data.schoolName,
        paymentUrl: data.paymentUrl,
        supportEmail: 'support@smart-s.com',
        year: new Date().getFullYear(),
      },
      priority: data.isOverdue ? 'high' : 'normal',
    };

    return this.sendEmail(emailData);
  }

  // Send payment success email
  static async sendPaymentSuccessEmail(data: {
    recipientEmail: string;
    studentName: string;
    regNo: string;
    feeName: string;
    amount: number;
    transactionRef: string;
    paymentDate: string;
    paymentMethod: string;
    schoolName: string;
  }): Promise<EmailResponse> {
    const emailData: SendEmailRequest = {
      to: data.recipientEmail,
      subject: `Payment Confirmation - ${data.feeName}`,
      templateId: 'payment_success',
      templateVariables: {
        studentName: data.studentName,
        regNo: data.regNo,
        feeName: data.feeName,
        amount: data.amount,
        formattedAmount: new Intl.NumberFormat('en-NG', {
          style: 'currency',
          currency: 'NGN',
        }).format(data.amount),
        transactionRef: data.transactionRef,
        paymentDate: new Date(data.paymentDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        paymentMethod: data.paymentMethod,
        schoolName: data.schoolName,
        supportEmail: 'support@smart-s.com',
        year: new Date().getFullYear(),
      },
    };

    return this.sendEmail(emailData);
  }

  // Send fee approval notification email
  static async sendFeeApprovalEmail(data: {
    recipientEmail: string;
    studentName: string;
    regNo: string;
    feeName: string;
    amount: number;
    termName: string;
    schoolName: string;
    paymentUrl: string;
  }): Promise<EmailResponse> {
    const emailData: SendEmailRequest = {
      to: data.recipientEmail,
      subject: `New Fee Available: ${data.feeName}`,
      templateId: 'fee_approved',
      templateVariables: {
        studentName: data.studentName,
        regNo: data.regNo,
        feeName: data.feeName,
        amount: data.amount,
        formattedAmount: new Intl.NumberFormat('en-NG', {
          style: 'currency',
          currency: 'NGN',
        }).format(data.amount),
        termName: data.termName,
        schoolName: data.schoolName,
        paymentUrl: data.paymentUrl,
        supportEmail: 'support@smart-s.com',
        year: new Date().getFullYear(),
      },
    };

    return this.sendEmail(emailData);
  }

  // Get email templates
  static async getEmailTemplates(): Promise<EmailTemplate[]> {
    const response = await ApiService.get<EmailTemplate[]>('/email/templates');
    return response || [];
  }

  // Create email template
  static async createEmailTemplate(template: Omit<EmailTemplate, 'id'>): Promise<EmailTemplate> {
    const response = await ApiService.post<EmailTemplate>('/email/templates', template);
    if (!response) {
      throw new Error('Failed to create email template');
    }
    return response;
  }

  // Update email template
  static async updateEmailTemplate(templateId: string, template: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const response = await ApiService.put<EmailTemplate>(`/email/templates/${templateId}`, template);
    if (!response) {
      throw new Error('Failed to update email template');
    }
    return response;
  }

  // Get email configuration
  static async getEmailConfig(): Promise<EmailConfig> {
    const response = await ApiService.get<EmailConfig>('/email/config');
    if (!response) {
      throw new Error('Failed to get email configuration');
    }
    return response;
  }

  // Update email configuration
  static async updateEmailConfig(config: Partial<EmailConfig>): Promise<EmailConfig> {
    const response = await ApiService.put<EmailConfig>('/email/config', config);
    if (!response) {
      throw new Error('Failed to update email configuration');
    }
    return response;
  }

  // Test email configuration
  static async testEmailConfig(testEmail: string): Promise<{ success: boolean; message: string }> {
    const response = await ApiService.post<{ success: boolean; message: string }>('/email/test', {
      testEmail,
    });
    if (!response) {
      throw new Error('Failed to test email configuration');
    }
    return response;
  }

  // Get email statistics
  static async getEmailStats(dateRange?: { from: string; to: string }): Promise<EmailStats> {
    const params = new URLSearchParams();
    if (dateRange) {
      params.append('from', dateRange.from);
      params.append('to', dateRange.to);
    }
    
    const response = await ApiService.get<EmailStats>(`/email/stats?${params.toString()}`);
    if (!response) {
      throw new Error('Failed to get email statistics');
    }
    return response;
  }

  // Utility methods
  private static getEmailSubject(notification: Notification): string {
    switch (notification.type) {
      case 'payment_reminder':
        return `Payment Reminder: ${notification.title}`;
      case 'payment_overdue':
        return `URGENT: ${notification.title}`;
      case 'success':
        return `Confirmation: ${notification.title}`;
      case 'error':
        return `Alert: ${notification.title}`;
      default:
        return notification.title;
    }
  }

  private static getTemplateId(notificationType: Notification['type']): string {
    const templateMap = {
      payment_reminder: 'payment_reminder',
      payment_overdue: 'payment_overdue',
      success: 'payment_success',
      error: 'payment_failed',
      info: 'system_notification',
      warning: 'system_notification',
    };
    return templateMap[notificationType] || 'system_notification';
  }

  // Email validation
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Format email list
  static formatEmailList(emails: string[]): string {
    return emails.filter(this.validateEmail).join(', ');
  }

  // Get email domain
  static getEmailDomain(email: string): string {
    return email.split('@')[1] || '';
  }

  // Check if email is from school domain
  static isSchoolEmail(email: string, schoolDomain: string): boolean {
    return this.getEmailDomain(email).toLowerCase() === schoolDomain.toLowerCase();
  }
}
