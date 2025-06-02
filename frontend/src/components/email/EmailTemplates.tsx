import React from 'react';

// Email template components for preview and editing
export const PaymentReminderTemplate: React.FC<{
  variables: {
    studentName: string;
    feeName: string;
    formattedAmount: string;
    dueDate: string;
    daysUntilDue: number;
    schoolName: string;
    paymentUrl: string;
    supportEmail: string;
  };
}> = ({ variables }) => (
  <div className="max-w-2xl mx-auto bg-white">
    {/* Header */}
    <div className="bg-blue-600 text-white p-6 text-center">
      <h1 className="text-2xl font-bold">{variables.schoolName}</h1>
      <p className="text-blue-100 mt-2">Payment Reminder</p>
    </div>

    {/* Content */}
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Payment Due {variables.daysUntilDue === 0 ? 'Today' : `in ${variables.daysUntilDue} day(s)`}
      </h2>
      
      <p className="text-gray-700 mb-4">
        Dear {variables.studentName},
      </p>
      
      <p className="text-gray-700 mb-4">
        This is a friendly reminder that your payment for <strong>{variables.feeName}</strong> is due soon.
      </p>

      {/* Payment Details */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Payment Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Fee:</span>
            <span className="font-medium">{variables.feeName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="font-medium text-green-600">{variables.formattedAmount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Due Date:</span>
            <span className="font-medium">{variables.dueDate}</span>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center mb-6">
        <a
          href={variables.paymentUrl}
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Pay Now
        </a>
      </div>

      <p className="text-gray-600 text-sm mb-4">
        Please make your payment before the due date to avoid any late fees or penalties.
      </p>

      <p className="text-gray-600 text-sm">
        If you have any questions or need assistance, please contact us at{' '}
        <a href={`mailto:${variables.supportEmail}`} className="text-blue-600 hover:underline">
          {variables.supportEmail}
        </a>
      </p>
    </div>

    {/* Footer */}
    <div className="bg-gray-100 p-4 text-center text-sm text-gray-600">
      <p>&copy; {new Date().getFullYear()} {variables.schoolName}. All rights reserved.</p>
    </div>
  </div>
);

export const PaymentOverdueTemplate: React.FC<{
  variables: {
    studentName: string;
    feeName: string;
    formattedAmount: string;
    dueDate: string;
    daysOverdue: number;
    schoolName: string;
    paymentUrl: string;
    supportEmail: string;
  };
}> = ({ variables }) => (
  <div className="max-w-2xl mx-auto bg-white">
    {/* Header */}
    <div className="bg-red-600 text-white p-6 text-center">
      <h1 className="text-2xl font-bold">{variables.schoolName}</h1>
      <p className="text-red-100 mt-2">URGENT: Payment Overdue</p>
    </div>

    {/* Content */}
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold text-red-800 mb-2">
          Payment Overdue Notice
        </h2>
        <p className="text-red-700">
          Your payment is {variables.daysOverdue} day(s) overdue. Please make payment immediately.
        </p>
      </div>
      
      <p className="text-gray-700 mb-4">
        Dear {variables.studentName},
      </p>
      
      <p className="text-gray-700 mb-4">
        Your payment for <strong>{variables.feeName}</strong> was due on {variables.dueDate} and is now overdue.
        Please make payment immediately to avoid additional penalties.
      </p>

      {/* Payment Details */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Payment Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Fee:</span>
            <span className="font-medium">{variables.feeName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="font-medium text-red-600">{variables.formattedAmount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Original Due Date:</span>
            <span className="font-medium">{variables.dueDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Days Overdue:</span>
            <span className="font-medium text-red-600">{variables.daysOverdue} day(s)</span>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center mb-6">
        <a
          href={variables.paymentUrl}
          className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          Pay Now to Avoid Penalties
        </a>
      </div>

      <p className="text-gray-600 text-sm mb-4">
        <strong>Important:</strong> Late payment may result in additional fees or restrictions on school services.
      </p>

      <p className="text-gray-600 text-sm">
        If you have already made this payment or need assistance, please contact us immediately at{' '}
        <a href={`mailto:${variables.supportEmail}`} className="text-red-600 hover:underline">
          {variables.supportEmail}
        </a>
      </p>
    </div>

    {/* Footer */}
    <div className="bg-gray-100 p-4 text-center text-sm text-gray-600">
      <p>&copy; {new Date().getFullYear()} {variables.schoolName}. All rights reserved.</p>
    </div>
  </div>
);

export const PaymentSuccessTemplate: React.FC<{
  variables: {
    studentName: string;
    feeName: string;
    formattedAmount: string;
    transactionRef: string;
    paymentDate: string;
    paymentMethod: string;
    schoolName: string;
    supportEmail: string;
  };
}> = ({ variables }) => (
  <div className="max-w-2xl mx-auto bg-white">
    {/* Header */}
    <div className="bg-green-600 text-white p-6 text-center">
      <h1 className="text-2xl font-bold">{variables.schoolName}</h1>
      <p className="text-green-100 mt-2">Payment Confirmation</p>
    </div>

    {/* Content */}
    <div className="p-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-center">
        <div className="text-green-600 text-4xl mb-2">✓</div>
        <h2 className="text-xl font-semibold text-green-800 mb-2">
          Payment Successful!
        </h2>
        <p className="text-green-700">
          Your payment has been processed successfully.
        </p>
      </div>
      
      <p className="text-gray-700 mb-4">
        Dear {variables.studentName},
      </p>
      
      <p className="text-gray-700 mb-4">
        Thank you for your payment. We have successfully received your payment for <strong>{variables.feeName}</strong>.
      </p>

      {/* Payment Details */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Payment Receipt</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Fee:</span>
            <span className="font-medium">{variables.feeName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Amount Paid:</span>
            <span className="font-medium text-green-600">{variables.formattedAmount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Payment Date:</span>
            <span className="font-medium">{variables.paymentDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Payment Method:</span>
            <span className="font-medium capitalize">{variables.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Transaction Reference:</span>
            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{variables.transactionRef}</span>
          </div>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4">
        Please keep this email as your payment receipt. You can also access your payment history through your student portal.
      </p>

      <p className="text-gray-600 text-sm">
        If you have any questions about this payment, please contact us at{' '}
        <a href={`mailto:${variables.supportEmail}`} className="text-green-600 hover:underline">
          {variables.supportEmail}
        </a>
      </p>
    </div>

    {/* Footer */}
    <div className="bg-gray-100 p-4 text-center text-sm text-gray-600">
      <p>&copy; {new Date().getFullYear()} {variables.schoolName}. All rights reserved.</p>
    </div>
  </div>
);

export const FeeApprovedTemplate: React.FC<{
  variables: {
    studentName: string;
    feeName: string;
    formattedAmount: string;
    termName: string;
    schoolName: string;
    paymentUrl: string;
    supportEmail: string;
  };
}> = ({ variables }) => (
  <div className="max-w-2xl mx-auto bg-white">
    {/* Header */}
    <div className="bg-purple-600 text-white p-6 text-center">
      <h1 className="text-2xl font-bold">{variables.schoolName}</h1>
      <p className="text-purple-100 mt-2">New Fee Available</p>
    </div>

    {/* Content */}
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        New Fee Available for Payment
      </h2>
      
      <p className="text-gray-700 mb-4">
        Dear {variables.studentName},
      </p>
      
      <p className="text-gray-700 mb-4">
        A new fee <strong>{variables.feeName}</strong> has been approved and is now available for payment.
      </p>

      {/* Fee Details */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Fee Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Fee Name:</span>
            <span className="font-medium">{variables.feeName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="font-medium text-purple-600">{variables.formattedAmount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Term:</span>
            <span className="font-medium">{variables.termName}</span>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center mb-6">
        <a
          href={variables.paymentUrl}
          className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
        >
          View and Pay Fee
        </a>
      </div>

      <p className="text-gray-600 text-sm mb-4">
        You can now proceed to make payment for this fee through your student portal.
      </p>

      <p className="text-gray-600 text-sm">
        If you have any questions about this fee, please contact us at{' '}
        <a href={`mailto:${variables.supportEmail}`} className="text-purple-600 hover:underline">
          {variables.supportEmail}
        </a>
      </p>
    </div>

    {/* Footer */}
    <div className="bg-gray-100 p-4 text-center text-sm text-gray-600">
      <p>&copy; {new Date().getFullYear()} {variables.schoolName}. All rights reserved.</p>
    </div>
  </div>
);

// Template preview component
export const EmailTemplatePreview: React.FC<{
  template: 'payment_reminder' | 'payment_overdue' | 'payment_success' | 'fee_approved';
  variables: Record<string, any>;
}> = ({ template, variables }) => {
  const renderTemplate = () => {
    switch (template) {
      case 'payment_reminder':
        return <PaymentReminderTemplate variables={variables} />;
      case 'payment_overdue':
        return <PaymentOverdueTemplate variables={variables} />;
      case 'payment_success':
        return <PaymentSuccessTemplate variables={variables} />;
      case 'fee_approved':
        return <FeeApprovedTemplate variables={variables} />;
      default:
        return <div>Template not found</div>;
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {renderTemplate()}
    </div>
  );
};
