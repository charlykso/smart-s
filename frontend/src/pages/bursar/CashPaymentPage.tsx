import React, { useEffect, useState } from 'react';
import {
  BanknotesIcon,
  MagnifyingGlassIcon,
  UserIcon,
  CheckCircleIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFeeStore } from '../../store/feeStore';
import { useUserStore } from '../../store/userStore';
import { useAuthStore } from '../../store/authStore';
import { FeeService } from '../../services/feeService';
import MainLayout from '../../components/layout/MainLayout';
import toast from 'react-hot-toast';
import type { Fee } from '../../types/fee';

const cashPaymentSchema = z.object({
  student_reg_no: z.string().min(1, 'Student registration number is required'),
  fee_id: z.string().min(1, 'Please select a fee'),
  amount: z.number().min(1, 'Amount must be greater than 0'),
  payment_type: z.enum(['full', 'partial']),
  notes: z.string().optional(),
});

type CashPaymentFormData = z.infer<typeof cashPaymentSchema>;

// Define local interface for userStore User type which is different from auth User
interface UserStoreUser {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  roles: string[];
  regNo: string;
  school?: string | { _id: string; name: string };
  classArm?: string; // Add classArm property
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaymentSuccess {
  payment: {
    amount: number;
    trx_ref?: string;
  };
  student: UserStoreUser;
  fee: Fee;
  notes?: string;
}

const CashPaymentPage: React.FC = () => {
  const { processCashPayment, fees, loadFees, isLoading } = useFeeStore();
  const { users, loadUsers } = useUserStore();
  const { isAuthenticated, user } = useAuthStore();
  
  // Helper function to safely get term name
  const getTermName = (term: string | { name?: string } | null | undefined): string => {
    if (!term) return 'No Term';
    if (typeof term === 'string') return 'Unknown Term';
    return term.name ?? 'Unknown Term';
  };

  // Helper function to safely get session name
  const getSessionName = (term: string | { session?: { name?: string } } | null | undefined): string => {
    if (!term || typeof term === 'string') return '';
    return term.session?.name ?? '';
  };
  
  const [selectedStudent, setSelectedStudent] = useState<UserStoreUser | null>(null);
  const [studentFees, setStudentFees] = useState<Fee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState<PaymentSuccess | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CashPaymentFormData>({
    resolver: zodResolver(cashPaymentSchema),
  });

  const selectedFeeId = watch('fee_id');
  const paymentType = watch('payment_type');

  useEffect(() => {
    loadFees();
    loadUsers({ role: 'Student' });
  }, [loadFees, loadUsers]);

  // Check authentication and role permissions
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to access this page');
      return;
    }
    
    if (!user?.roles?.includes('Bursar')) {
      toast.error('Access denied. This page is only available to Bursars.');
    }
  }, [isAuthenticated, user]);

  // Filter students based on search query
  const filteredStudents = users.filter(user => 
    user.roles?.includes('Student') && (
      user.regNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${user.firstname} ${user.lastname}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleStudentSelect = (student: UserStoreUser) => {
    setSelectedStudent(student);
    setValue('student_reg_no', student.regNo);
    
    // Filter fees for this student's school and current term
    const studentSchoolFees = fees.filter(fee => {
      if (!fee.isApproved || !fee.isActive) return false;
      
      // Handle both string and object school IDs
      const feeSchoolId = typeof fee.school === 'object' ? fee.school?._id : fee.school;
      const studentSchoolId = typeof student.school === 'object' ? student.school?._id : student.school;
      
      return feeSchoolId === studentSchoolId;
    });
    
    setStudentFees(studentSchoolFees);
    setSearchQuery('');
  };

  const selectedFee = studentFees.find(fee => fee._id === selectedFeeId);

  const handleFormSubmit = async (data: CashPaymentFormData) => {
    if (!selectedStudent || !selectedFee) return;

    // Debug logging
    console.log('Cash Payment Debug Info:', {
      selectedStudent: selectedStudent,
      selectedStudentId: selectedStudent._id,
      selectedFee: selectedFee,
      feeId: data.fee_id,
      formData: data
    });

    try {
      const payment = await processCashPayment({
        user_id: selectedStudent._id,
        fee_id: data.fee_id,
      });

      setPaymentSuccess({
        payment,
        student: selectedStudent,
        fee: selectedFee,
        notes: data.notes,
      });

      toast.success('Cash payment processed successfully!');
      
      // Reset form
      reset();
      setSelectedStudent(null);
      setStudentFees([]);
    } catch (error) {
      console.error('Cash payment error:', error);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('unauthorized')) {
          toast.error('Session expired. Please login again.');
        } else if (error.message.includes('Payment already exists')) {
          toast.error('Payment for this fee has already been processed for this student.');
        } else if (error.message.includes('Invalid user ID format')) {
          toast.error('Invalid student selected. Please select a valid student.');
        } else if (error.message.includes('Invalid fee ID format')) {
          toast.error('Invalid fee selected. Please select a valid fee.');
        } else if (error.message.includes('User not found')) {
          toast.error('Selected student not found in database.');
        } else if (error.message.includes('Fee not found')) {
          toast.error('Selected fee not found in database.');
        } else {
          toast.error(error.message || 'Failed to process cash payment');
        }
      } else {
        toast.error('Failed to process cash payment');
      }
    }
  };

  const handlePrintReceipt = () => {
    if (!paymentSuccess) return;
    
    // Get school name from student data
    const schoolName = typeof paymentSuccess.student.school === 'object' 
      ? paymentSuccess.student.school.name 
      : 'Smart School Academy';
    
    // Create a professional receipt with school logo
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const receiptHtml = `
        <html>
          <head>
            <title>Payment Receipt</title>
            <style>
              body {
                font-family: 'Arial', sans-serif;
                margin: 0;
                padding: 20px;
                background: white;
                color: #333;
              }
              .receipt-container {
                max-width: 600px;
                margin: 0 auto;
                border: 2px solid #ddd;
                border-radius: 10px;
                overflow: hidden;
              }
              .header {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                padding: 20px;
                text-align: center;
              }
              .logo {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                border: 3px solid white;
                margin: 0 auto 15px;
                display: block;
                object-fit: cover;
              }
              .school-name {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 5px;
              }
              .receipt-title {
                font-size: 18px;
                margin-top: 10px;
                opacity: 0.9;
              }
              .content {
                padding: 30px;
              }
              .receipt-info {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 30px;
              }
              .info-group h4 {
                color: #3b82f6;
                margin: 0 0 10px 0;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .info-group p {
                margin: 5px 0;
                font-size: 16px;
              }
              .amount-section {
                background: #f8fafc;
                border: 2px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                margin: 20px 0;
              }
              .amount {
                font-size: 32px;
                font-weight: bold;
                color: #059669;
                margin: 10px 0;
              }
              .footer {
                border-top: 2px solid #e2e8f0;
                padding: 20px;
                text-align: center;
                color: #64748b;
                font-size: 14px;
              }
              .reference {
                background: #f1f5f9;
                border-left: 4px solid #3b82f6;
                padding: 15px;
                margin: 20px 0;
                font-family: monospace;
              }
              @media print {
                body { margin: 0; padding: 10px; }
                .receipt-container { border: 1px solid #000; }
              }
            </style>
          </head>
          <body>
            <div class="receipt-container">
              <div class="header">
                <img src="/ledgrio-combine.jpg" alt="School Logo" class="logo" />
                <div class="school-name">${schoolName}</div>
                <div class="receipt-title">CASH PAYMENT RECEIPT</div>
              </div>
              
              <div class="content">
                <div class="receipt-info">
                  <div class="info-group">
                    <h4>Student Information</h4>
                    <p><strong>Name:</strong> ${paymentSuccess.student.firstname} ${paymentSuccess.student.lastname}</p>
                    <p><strong>Reg No:</strong> ${paymentSuccess.student.regNo}</p>
                    <p><strong>Class:</strong> ${paymentSuccess.student.classArm ?? 'N/A'}</p>
                  </div>
                  
                  <div class="info-group">
                    <h4>Payment Details</h4>
                    <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                    <p><strong>Time:</strong> ${new Date().toLocaleTimeString()}</p>
                    <p><strong>Method:</strong> Cash Payment</p>
                  </div>
                </div>
                
                <div class="amount-section">
                  <h4 style="margin-top: 0; color: #64748b;">Fee Description</h4>
                  <p style="font-size: 18px; margin: 10px 0;"><strong>${paymentSuccess.fee.name}</strong></p>
                  <div class="amount">${FeeService.formatAmount(paymentSuccess.payment.amount)}</div>
                  <p style="color: #64748b; margin-bottom: 0;">Amount Paid in Full</p>
                </div>
                
                ${paymentSuccess.notes ? `
                  <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0;">
                    <h4 style="margin-top: 0; color: #92400e;">Notes:</h4>
                    <p style="margin-bottom: 0;">${paymentSuccess.notes}</p>
                  </div>
                ` : ''}
                
                <div class="reference">
                  <strong>Transaction Reference:</strong> ${paymentSuccess.payment.trx_ref || 'N/A'}
                </div>
              </div>
              
              <div class="footer">
                <p><strong>Receipt Generated:</strong> ${new Date().toLocaleString()}</p>
                <p>This is an official receipt for cash payment. Please keep for your records.</p>
                <p style="margin-top: 15px; font-size: 12px;">
                  Powered by Ledgrio School Management System
                </p>
              </div>
            </div>
            
            <script>
              // Auto-print when page loads
              window.onload = function() {
                window.print();
              }
            </script>
          </body>
        </html>
      `;
      printWindow.document.open();
      // Using document.write for printing functionality - acceptable for print window
      printWindow.document.write(receiptHtml);
      printWindow.document.close();
    }
    
    toast.success('Receipt opened for printing');
  };

  const handleNewPayment = () => {
    setPaymentSuccess(null);
    reset();
    setSelectedStudent(null);
    setStudentFees([]);
  };

  if (paymentSuccess) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8">
            {/* Success Header */}
            <div className="text-center mb-8">
              <CheckCircleIcon className="mx-auto h-16 w-16 text-green-600 mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Payment Successful!</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Cash payment has been processed successfully</p>
            </div>

            {/* Receipt Details */}
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 mb-6 bg-gray-50 dark:bg-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Payment Receipt</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Student Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="break-words">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Name:</span>
                      <p className="text-gray-900 dark:text-gray-100 mt-1">{paymentSuccess.student.firstname} {paymentSuccess.student.lastname}</p>
                    </div>
                    <div className="break-words">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Reg No:</span>
                      <p className="text-gray-900 dark:text-gray-100 mt-1">{paymentSuccess.student.regNo}</p>
                    </div>
                    <div className="break-words">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>
                      <p className="text-gray-900 dark:text-gray-100 mt-1 break-all">{paymentSuccess.student.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Payment Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="break-words">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Fee:</span>
                      <p className="text-gray-900 dark:text-gray-100 mt-1">{paymentSuccess.fee.name}</p>
                    </div>
                    <div className="break-words">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Amount:</span>
                      <p className="text-gray-900 dark:text-gray-100 mt-1 font-semibold">{FeeService.formatAmount(paymentSuccess.payment.amount)}</p>
                    </div>
                    <div className="break-words">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Method:</span>
                      <p className="text-gray-900 dark:text-gray-100 mt-1">Cash</p>
                    </div>
                    <div className="break-words">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Reference:</span>
                      <p className="text-gray-900 dark:text-gray-100 mt-1 break-all font-mono text-xs">{paymentSuccess.payment.trx_ref}</p>
                    </div>
                    <div className="break-words">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Date:</span>
                      <p className="text-gray-900 dark:text-gray-100 mt-1">{new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {paymentSuccess.notes && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Notes</h3>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{paymentSuccess.notes}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 w-full sm:w-auto"
              >
                <PrinterIcon className="h-4 w-4 mr-2" />
                Print Receipt
              </button>

              <button
                type="button"
                onClick={handleNewPayment}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 w-full sm:w-auto"
              >
                <BanknotesIcon className="h-4 w-4 mr-2" />
                New Payment
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-secondary-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <BanknotesIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-secondary-900 dark:text-gray-100">
                Cash Payment Processing
              </h1>
              <p className="text-secondary-600 dark:text-gray-300 mt-1">
                Process cash payments for student fees
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Student Search */}
            <div>
              <label htmlFor="student-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Student
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  id="student-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, registration number, or email..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Student Search Results */}
              {searchQuery && (
                <div className="mt-2 max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
                  {filteredStudents.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                      No students found matching "{searchQuery}"
                    </div>
                  ) : (
                    filteredStudents.map((student) => (
                      <button
                        key={student._id}
                        type="button"
                        onClick={() => handleStudentSelect(student)}
                        className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-600 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                      >
                        <div className="flex items-center">
                          <UserIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {student.firstname} {student.lastname}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {student.regNo} • {student.email}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Selected Student */}
            {selectedStudent && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Selected Student</h3>
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      {selectedStudent.firstname} {selectedStudent.lastname}
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      {selectedStudent.regNo} • {selectedStudent.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Hidden Student Reg No Field */}
            <input type="hidden" {...register('student_reg_no')} />

            {/* Fee Selection */}
            {selectedStudent && (
              <div>
                <label htmlFor="fee-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Fee *
                </label>
                <select
                  id="fee-select"
                  {...register('fee_id')}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                >
                  <option value="">Choose a fee to pay</option>
                  {studentFees.map((fee) => {
                    const termName = getTermName(fee.term);
                    const sessionName = getSessionName(fee.term);
                    const truncatedFeeName = fee.name.length > 25 ? `${fee.name.substring(0, 25)}...` : fee.name;
                    
                    return (
                      <option key={fee._id} value={fee._id} className="py-2">
                        {truncatedFeeName} - {FeeService.formatAmount(fee.amount)} ({fee.type}) • {termName}{sessionName ? ` - ${sessionName}` : ''}
                      </option>
                    );
                  })}
                </select>
                {errors.fee_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.fee_id.message}</p>
                )}
              </div>
            )}

            {/* Fee Details */}
            {selectedFee && (
              <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Fee Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Fee Name:</span>
                    <p className="font-medium text-gray-900 dark:text-gray-100 break-words">{selectedFee.name}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Amount:</span>
                    <p className="font-medium text-gray-900 dark:text-gray-100 text-lg">{FeeService.formatAmount(selectedFee.amount)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Type:</span>
                    <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">{selectedFee.type}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Term:</span>
                    <p className="font-medium text-gray-900 dark:text-gray-100 break-words">
                      {getTermName(selectedFee.term)}
                      {getSessionName(selectedFee.term) ? (
                        <span className="block text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Session: {getSessionName(selectedFee.term)}
                        </span>
                      ) : ''}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Type */}
            {selectedFee && (
              <div>
                <fieldset>
                  <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Type *
                  </legend>
                  <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      {...register('payment_type')}
                      value="full"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">
                      Full Payment - {FeeService.formatAmount(selectedFee.amount)}
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      {...register('payment_type')}
                      value="partial"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">Partial Payment</span>
                  </label>
                </div>
                </fieldset>
              </div>
            )}

            {/* Amount Input for Partial Payment */}
            {paymentType === 'partial' && (
              <div>
                <label htmlFor="payment-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Amount (₦) *
                </label>
                <input
                  id="payment-amount"
                  type="number"
                  {...register('amount', { valueAsNumber: true })}
                  max={selectedFee?.amount}
                  min={1}
                  step="0.01"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter amount"
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                )}
              </div>
            )}

            {/* Set full amount for full payment */}
            {paymentType === 'full' && selectedFee && (
              <input type="hidden" {...register('amount', { value: selectedFee.amount })} />
            )}

            {/* Notes */}
            <div>
              <label htmlFor="payment-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                id="payment-notes"
                {...register('notes')}
                rows={3}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Add any additional notes about this payment..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center sm:justify-end pt-4">
              <button
                type="submit"
                disabled={isLoading || !selectedStudent || !selectedFee}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <BanknotesIcon className="h-5 w-5 mr-2" />
                    Process Cash Payment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CashPaymentPage;
