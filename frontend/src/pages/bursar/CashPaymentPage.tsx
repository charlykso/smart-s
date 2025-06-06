import React, { useEffect, useState } from 'react';
import {
  BanknotesIcon,
  MagnifyingGlassIcon,
  UserIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  PrinterIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFeeStore } from '../../store/feeStore';
import { useUserStore } from '../../store/userStore';
import { FeeService } from '../../services/feeService';
import MainLayout from '../../components/layout/MainLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const cashPaymentSchema = z.object({
  student_reg_no: z.string().min(1, 'Student registration number is required'),
  fee_id: z.string().min(1, 'Please select a fee'),
  amount: z.number().min(1, 'Amount must be greater than 0'),
  payment_type: z.enum(['full', 'partial']),
  notes: z.string().optional(),
});

type CashPaymentFormData = z.infer<typeof cashPaymentSchema>;

const CashPaymentPage: React.FC = () => {
  const { processCashPayment, fees, loadFees, isLoading } = useFeeStore();
  const { users, loadUsers } = useUserStore();
  
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentFees, setStudentFees] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState<any>(null);

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

  // Filter students based on search query
  const filteredStudents = users.filter(user => 
    user.roles?.includes('Student') && (
      user.regNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${user.firstname} ${user.lastname}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleStudentSelect = (student: any) => {
    setSelectedStudent(student);
    setValue('student_reg_no', student.regNo);
    
    // Filter fees for this student's school and current term
    const studentSchoolFees = fees.filter(fee => 
      fee.isApproved && 
      fee.isActive &&
      (typeof fee.school === 'object' ? fee.school._id === student.school?._id : true)
    );
    
    setStudentFees(studentSchoolFees);
    setSearchQuery('');
  };

  const selectedFee = studentFees.find(fee => fee._id === selectedFeeId);

  const handleFormSubmit = async (data: CashPaymentFormData) => {
    if (!selectedStudent || !selectedFee) return;

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
      toast.error('Failed to process cash payment');
    }
  };

  const handlePrintReceipt = () => {
    if (!paymentSuccess) return;
    
    // TODO: Implement receipt printing
    console.log('Print receipt for:', paymentSuccess);
    toast.success('Receipt sent to printer');
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
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Success Header */}
            <div className="text-center mb-8">
              <CheckCircleIcon className="mx-auto h-16 w-16 text-green-600 mb-4" />
              <h1 className="text-2xl font-bold text-gray-900">Payment Successful!</h1>
              <p className="text-gray-600 mt-2">Cash payment has been processed successfully</p>
            </div>

            {/* Receipt Details */}
            <div className="border border-gray-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Receipt</h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Student Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Name:</span> {paymentSuccess.student.firstname} {paymentSuccess.student.lastname}</p>
                    <p><span className="font-medium">Reg No:</span> {paymentSuccess.student.regNo}</p>
                    <p><span className="font-medium">Email:</span> {paymentSuccess.student.email}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Payment Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Fee:</span> {paymentSuccess.fee.name}</p>
                    <p><span className="font-medium">Amount:</span> {FeeService.formatAmount(paymentSuccess.payment.amount)}</p>
                    <p><span className="font-medium">Method:</span> Cash</p>
                    <p><span className="font-medium">Reference:</span> {paymentSuccess.payment.trx_ref}</p>
                    <p><span className="font-medium">Date:</span> {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {paymentSuccess.notes && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Notes</h3>
                  <p className="text-sm text-gray-900">{paymentSuccess.notes}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-center space-x-4">
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <PrinterIcon className="h-4 w-4 mr-2" />
                Print Receipt
              </button>

              <button
                type="button"
                onClick={handleNewPayment}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
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
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <div className="flex items-center">
            <BanknotesIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">
                Cash Payment Processing
              </h1>
              <p className="text-secondary-600 mt-1">
                Process cash payments for student fees
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Student Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Student
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, registration number, or email..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Student Search Results */}
              {searchQuery && (
                <div className="mt-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                  {filteredStudents.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500 text-center">
                      No students found matching "{searchQuery}"
                    </div>
                  ) : (
                    filteredStudents.map((student) => (
                      <button
                        key={student._id}
                        type="button"
                        onClick={() => handleStudentSelect(student)}
                        className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center">
                          <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {student.firstname} {student.lastname}
                            </p>
                            <p className="text-xs text-gray-500">
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
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Selected Student</h3>
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      {selectedStudent.firstname} {selectedStudent.lastname}
                    </p>
                    <p className="text-xs text-blue-700">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Fee *
                </label>
                <select
                  {...register('fee_id')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Choose a fee to pay</option>
                  {studentFees.map((fee) => (
                    <option key={fee._id} value={fee._id}>
                      {fee.name} - {FeeService.formatAmount(fee.amount)} ({fee.type})
                    </option>
                  ))}
                </select>
                {errors.fee_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.fee_id.message}</p>
                )}
              </div>
            )}

            {/* Fee Details */}
            {selectedFee && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Fee Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Fee Name:</span>
                    <p className="font-medium">{selectedFee.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Amount:</span>
                    <p className="font-medium">{FeeService.formatAmount(selectedFee.amount)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <p className="font-medium capitalize">{selectedFee.type}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Term:</span>
                    <p className="font-medium">
                      {typeof selectedFee.term === 'object' ? selectedFee.term.name : 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Type */}
            {selectedFee && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Type *
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      {...register('payment_type')}
                      value="full"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-900">
                      Full Payment - {FeeService.formatAmount(selectedFee.amount)}
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      {...register('payment_type')}
                      value="partial"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-900">Partial Payment</span>
                  </label>
                </div>
              </div>
            )}

            {/* Amount Input for Partial Payment */}
            {paymentType === 'partial' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount (₦) *
                </label>
                <input
                  type="number"
                  {...register('amount', { valueAsNumber: true })}
                  max={selectedFee?.amount}
                  min={1}
                  step="0.01"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                {...register('notes')}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Add any additional notes about this payment..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading || !selectedStudent || !selectedFee}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
