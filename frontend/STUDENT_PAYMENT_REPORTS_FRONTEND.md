# Frontend Implementation - Student Payment Reports PDF

## Overview
Frontend components and services for generating and downloading student payment reports in PDF format with flexible filtering options.

## Required Dependencies
```bash
npm install file-saver
npm install @types/file-saver
```

## 1. TypeScript Interfaces

```typescript
// src/types/reports.ts
export interface PaymentReportFilters {
  student_id: string;
  term_id?: string;
  session_id?: string;
  date_from?: string;
  date_to?: string;
  include_pending?: boolean;
  report_type?: 'detailed' | 'summary';
}

export interface MultipleStudentsReportFilters {
  student_ids: string[];
  term_id?: string;
  session_id?: string;
  date_from?: string;
  date_to?: string;
  include_pending?: boolean;
  report_type?: 'detailed' | 'summary';
}

export interface PaymentReportRequest {
  filters: PaymentReportFilters;
  filename?: string;
}

export interface ReportGenerationStatus {
  isGenerating: boolean;
  progress?: number;
  error?: string;
}
```

## 2. API Service Layer

```typescript
// src/services/reportService.ts
import apiClient from './apiClient';
import { saveAs } from 'file-saver';

class ReportService {
  async generateStudentPaymentReportPDF(filters: PaymentReportFilters): Promise<void> {
    try {
      const response = await apiClient.get(
        `/reports/student/${filters.student_id}/payments/pdf`,
        {
          params: {
            term_id: filters.term_id,
            session_id: filters.session_id,
            date_from: filters.date_from,
            date_to: filters.date_to,
            include_pending: filters.include_pending,
            report_type: filters.report_type
          },
          responseType: 'blob'
        }
      );

      // Extract filename from response headers or create default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'student-payment-report.pdf';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      saveAs(blob, filename);
    } catch (error) {
      console.error('Error generating student payment report:', error);
      throw new Error('Failed to generate payment report');
    }
  }

  async generateMultipleStudentsReportPDF(filters: MultipleStudentsReportFilters): Promise<void> {
    try {
      const response = await apiClient.post(
        '/reports/students/payments/pdf',
        filters,
        { responseType: 'blob' }
      );

      const contentDisposition = response.headers['content-disposition'];
      let filename = 'students-payment-report.pdf';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      const blob = new Blob([response.data], { type: 'application/pdf' });
      saveAs(blob, filename);
    } catch (error) {
      console.error('Error generating students payment report:', error);
      throw new Error('Failed to generate students payment report');
    }
  }

  async previewStudentPaymentData(filters: PaymentReportFilters): Promise<any> {
    try {
      const response = await apiClient.get(
        `/audit/user/${filters.student_id}`,
        {
          params: {
            term_id: filters.term_id,
            session_id: filters.session_id,
            date_from: filters.date_from,
            date_to: filters.date_to
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching payment preview:', error);
      throw error;
    }
  }
}

export const reportService = new ReportService();
```

## 3. Custom Hooks

```typescript
// src/hooks/usePaymentReports.ts
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { reportService } from '@/services/reportService';
import { PaymentReportFilters, MultipleStudentsReportFilters } from '@/types/reports';
import toast from 'react-hot-toast';

export const useStudentPaymentReport = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReportMutation = useMutation({
    mutationFn: (filters: PaymentReportFilters) => {
      setIsGenerating(true);
      return reportService.generateStudentPaymentReportPDF(filters);
    },
    onSuccess: () => {
      toast.success('Payment report downloaded successfully');
      setIsGenerating(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate payment report');
      setIsGenerating(false);
    }
  });

  return {
    generateReport: generateReportMutation.mutate,
    isGenerating,
    error: generateReportMutation.error
  };
};

export const useMultipleStudentsReport = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReportMutation = useMutation({
    mutationFn: (filters: MultipleStudentsReportFilters) => {
      setIsGenerating(true);
      return reportService.generateMultipleStudentsReportPDF(filters);
    },
    onSuccess: () => {
      toast.success('Students payment report downloaded successfully');
      setIsGenerating(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate students payment report');
      setIsGenerating(false);
    }
  });

  return {
    generateReport: generateReportMutation.mutate,
    isGenerating,
    error: generateReportMutation.error
  };
};
```

## 4. Payment Report Form Component

```typescript
// src/components/reports/PaymentReportForm.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStudentPaymentReport } from '@/hooks/usePaymentReports';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/forms/FormField';
import { SelectField } from '@/components/forms/SelectField';
import { DateRangePicker } from '@/components/forms/DateRangePicker';

const paymentReportSchema = z.object({
  student_id: z.string().min(1, 'Student is required'),
  filter_type: z.enum(['term', 'session', 'date_range', 'all_time']),
  term_id: z.string().optional(),
  session_id: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  include_pending: z.boolean().default(false),
  report_type: z.enum(['detailed', 'summary']).default('detailed')
});

type PaymentReportFormData = z.infer<typeof paymentReportSchema>;

interface PaymentReportFormProps {
  students: Student[];
  sessions: Session[];
  terms: Term[];
  defaultStudentId?: string;
}

export const PaymentReportForm: React.FC<PaymentReportFormProps> = ({
  students,
  sessions,
  terms,
  defaultStudentId
}) => {
  const { generateReport, isGenerating } = useStudentPaymentReport();
  const [filterType, setFilterType] = useState<string>('all_time');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<PaymentReportFormData>({
    resolver: zodResolver(paymentReportSchema),
    defaultValues: {
      student_id: defaultStudentId || '',
      filter_type: 'all_time',
      include_pending: false,
      report_type: 'detailed'
    }
  });

  const watchedFilterType = watch('filter_type');

  const onSubmit = (data: PaymentReportFormData) => {
    const filters = {
      student_id: data.student_id,
      include_pending: data.include_pending,
      report_type: data.report_type
    };

    // Add filter-specific parameters
    switch (data.filter_type) {
      case 'term':
        if (data.term_id) filters.term_id = data.term_id;
        break;
      case 'session':
        if (data.session_id) filters.session_id = data.session_id;
        break;
      case 'date_range':
        if (data.date_from) filters.date_from = data.date_from;
        if (data.date_to) filters.date_to = data.date_to;
        break;
    }

    generateReport(filters);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-6">Generate Student Payment Report</h3>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Student Selection */}
        <SelectField
          label="Select Student"
          {...register('student_id')}
          options={students.map(student => ({
            value: student._id,
            label: `${student.firstname} ${student.lastname} (${student.regNo})`
          }))}
          error={errors.student_id?.message}
          required
        />

        {/* Filter Type */}
        <SelectField
          label="Report Period"
          {...register('filter_type')}
          options={[
            { value: 'all_time', label: 'All Time' },
            { value: 'session', label: 'By Session' },
            { value: 'term', label: 'By Term' },
            { value: 'date_range', label: 'Custom Date Range' }
          ]}
          onChange={(value) => setFilterType(value)}
          error={errors.filter_type?.message}
        />

        {/* Conditional Filter Fields */}
        {watchedFilterType === 'session' && (
          <SelectField
            label="Select Session"
            {...register('session_id')}
            options={sessions.map(session => ({
              value: session._id,
              label: session.name
            }))}
            error={errors.session_id?.message}
          />
        )}

        {watchedFilterType === 'term' && (
          <SelectField
            label="Select Term"
            {...register('term_id')}
            options={terms.map(term => ({
              value: term._id,
              label: term.name
            }))}
            error={errors.term_id?.message}
          />
        )}

        {watchedFilterType === 'date_range' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="From Date"
              type="date"
              {...register('date_from')}
              error={errors.date_from?.message}
            />
            <FormField
              label="To Date"
              type="date"
              {...register('date_to')}
              error={errors.date_to?.message}
            />
          </div>
        )}

        {/* Report Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Report Type"
            {...register('report_type')}
            options={[
              { value: 'detailed', label: 'Detailed Report' },
              { value: 'summary', label: 'Summary Report' }
            ]}
            error={errors.report_type?.message}
          />

          <div className="flex items-center space-x-2 mt-6">
            <input
              type="checkbox"
              id="include_pending"
              {...register('include_pending')}
              className="rounded border-gray-300"
            />
            <label htmlFor="include_pending" className="text-sm text-gray-700">
              Include pending payments
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            loading={isGenerating}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating PDF...' : 'Download PDF Report'}
          </Button>
        </div>
      </form>
    </div>
  );
};
```

## 5. Quick Report Buttons Component

```typescript
// src/components/reports/QuickReportButtons.tsx
import React from 'react';
import { Button } from '@/components/ui/Button';
import { useStudentPaymentReport } from '@/hooks/usePaymentReports';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';

interface QuickReportButtonsProps {
  studentId: string;
  currentTermId?: string;
  currentSessionId?: string;
}

export const QuickReportButtons: React.FC<QuickReportButtonsProps> = ({
  studentId,
  currentTermId,
  currentSessionId
}) => {
  const { generateReport, isGenerating } = useStudentPaymentReport();

  const handleQuickReport = (type: 'current_term' | 'current_session' | 'all_time') => {
    const baseFilters = {
      student_id: studentId,
      include_pending: false,
      report_type: 'detailed' as const
    };

    switch (type) {
      case 'current_term':
        if (currentTermId) {
          generateReport({ ...baseFilters, term_id: currentTermId });
        }
        break;
      case 'current_session':
        if (currentSessionId) {
          generateReport({ ...baseFilters, session_id: currentSessionId });
        }
        break;
      case 'all_time':
        generateReport(baseFilters);
        break;
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {currentTermId && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleQuickReport('current_term')}
          disabled={isGenerating}
          icon={DocumentArrowDownIcon}
        >
          Current Term Report
        </Button>
      )}
      
      {currentSessionId && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleQuickReport('current_session')}
          disabled={isGenerating}
          icon={DocumentArrowDownIcon}
        >
          Current Session Report
        </Button>
      )}
      
      <Button
        variant="secondary"
        size="sm"
        onClick={() => handleQuickReport('all_time')}
        disabled={isGenerating}
        icon={DocumentArrowDownIcon}
      >
        All Time Report
      </Button>
    </div>
  );
};
```

## 6. Integration in Student Profile/Dashboard

```typescript
// src/pages/students/StudentProfile.tsx
import { QuickReportButtons } from '@/components/reports/QuickReportButtons';
import { PaymentReportForm } from '@/components/reports/PaymentReportForm';

export const StudentProfile: React.FC = () => {
  const { studentId } = useParams();
  const { data: student } = useStudent(studentId);
  const { data: currentTerm } = useCurrentTerm();
  const { data: currentSession } = useCurrentSession();

  return (
    <div className="space-y-6">
      {/* Student Information */}
      <StudentInfoCard student={student} />
      
      {/* Quick Report Actions */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Payment Reports</h3>
        <QuickReportButtons
          studentId={studentId}
          currentTermId={currentTerm?._id}
          currentSessionId={currentSession?._id}
        />
      </div>
      
      {/* Detailed Report Form */}
      <PaymentReportForm
        students={[student]}
        sessions={sessions}
        terms={terms}
        defaultStudentId={studentId}
      />
    </div>
  );
};
```

This comprehensive frontend implementation provides an intuitive interface for generating student payment reports with flexible filtering options and seamless PDF download functionality.
