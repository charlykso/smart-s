import React, { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
  HomeIcon,
  ChevronRightIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ApiService } from '../../services/api';
import MainLayout from '../../components/layout/MainLayout';
import CenteredLoader from '../../components/common/CenteredLoader';
import toast from 'react-hot-toast';

interface GeneratedReport {
  id: string;
  title: string;
  createdAt: string;
  payload: unknown;
}

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'financial' | 'academic' | 'administrative' | 'audit';
  color: string;
}

interface ReportFilter {
  school?: string;
  session?: string;
  term?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filters, setFilters] = useState<ReportFilter>({});
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helpers to render a readable report view from arbitrary data
  const isPlainObject = (val: unknown): val is Record<string, any> =>
    !!val && typeof val === 'object' && !Array.isArray(val);

  const numberFormatter = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 });

  const prettifyKey = (key: string) => key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (s) => s.toUpperCase());

  const formatValue = (val: any) => {
    if (typeof val === 'number') return numberFormatter.format(val);
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    if (typeof val === 'string') return val;
    return String(val);
  };

  const renderKeyStats = (data: any) => {
    if (!isPlainObject(data)) return null;
    const statEntries = Object.entries(data)
      .filter(([_, v]) => typeof v === 'number')
      .slice(0, 6);
    if (statEntries.length === 0) return null;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {statEntries.map(([k, v]) => (
          <div key={k} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
            <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">{prettifyKey(k)}</div>
            <div className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{formatValue(v)}</div>
          </div>
        ))}
      </div>
    );
  };

  const pickTableColumns = (rows: any[]): string[] => {
    const sample = rows.find((r) => isPlainObject(r));
    if (!sample) return [];
    return Object.keys(sample).slice(0, 6); // limit columns for readability
  };

  const renderArrayTable = (title: string, rows: any[]) => {
    if (!Array.isArray(rows) || rows.length === 0) return null;
    const columns = pickTableColumns(rows);
    if (columns.length === 0) return null;
    return (
      <div className="mb-6">
        <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">{title}</div>
        <div className="overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {columns.map((col) => (
                  <th key={col} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">{prettifyKey(col)}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
              {rows.slice(0, 100).map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  {columns.map((col) => (
                    <td key={col} className="px-3 py-2 text-sm text-gray-800 dark:text-gray-200">
                      {formatValue((row as any)[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length > 100 && (
          <div className="mt-2 text-xs text-gray-500">Showing first 100 rows</div>
        )}
      </div>
    );
  };

  const renderObjectDetails = (data: Record<string, any>) => {
    const entries = Object.entries(data).filter(([_, v]) => typeof v !== 'object');
    if (entries.length === 0) return null;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {entries.map(([k, v]) => (
          <div key={k} className="rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3">
            <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">{prettifyKey(k)}</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">{formatValue(v)}</div>
          </div>
        ))}
      </div>
    );
  };

  const ReportContent: React.FC<{ data: any }> = ({ data }) => {
    if (!data) return <div className="text-sm text-gray-500">No data</div>;
    const sections: JSX.Element[] = [];

    // Top-level key stats
    const keyStats = renderKeyStats(data);
    if (keyStats) sections.push(keyStats);

    // If array at top level, render as table
    if (Array.isArray(data)) {
      sections.push(renderArrayTable('Items', data) as unknown as JSX.Element);
    }

    // For objects: render simple fields and attempt to render arrays/objects within
    if (isPlainObject(data)) {
      const obj = data as Record<string, any>;
      const simple = renderObjectDetails(obj);
      if (simple) sections.push(simple);

      Object.entries(obj).forEach(([k, v]) => {
        if (Array.isArray(v)) {
          const table = renderArrayTable(prettifyKey(k), v);
          if (table) sections.push(table as unknown as JSX.Element);
        } else if (isPlainObject(v)) {
          const innerStats = renderKeyStats(v);
          const innerDetails = renderObjectDetails(v);
          if (innerStats) sections.push((
            <div key={`stats-${k}`}>
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">{prettifyKey(k)}</div>
              {innerStats}
            </div>
          ));
          if (innerDetails) sections.push((
            <div key={`details-${k}`}>
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">{prettifyKey(k)}</div>
              {innerDetails}
            </div>
          ));
        }
      });
    }

    return <>{sections}</>;
  };

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  const reportTypes: ReportType[] = [
    {
      id: 'financial-summary',
      name: 'Financial Summary Report',
      description: 'Comprehensive overview of revenue, payments, and outstanding fees',
      icon: CurrencyDollarIcon,
      category: 'financial',
      color: 'bg-green-100 text-green-800',
    },
    {
      id: 'payment-analysis',
      name: 'Payment Analysis Report',
      description: 'Detailed analysis of payment patterns and collection rates',
      icon: ChartBarIcon,
      category: 'financial',
      color: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'student-enrollment',
      name: 'Student Enrollment Report',
      description: 'Student registration and enrollment statistics by school and class',
      icon: UsersIcon,
      category: 'academic',
      color: 'bg-purple-100 text-purple-800',
    },
    {
      id: 'fee-collection',
      name: 'Fee Collection Report',
      description: 'Track fee collection progress and outstanding amounts',
      icon: DocumentTextIcon,
      category: 'financial',
      color: 'bg-yellow-100 text-yellow-800',
    },
    {
      id: 'user-activity',
      name: 'User Activity Report',
      description: 'System usage and user activity across all roles',
      icon: UsersIcon,
      category: 'administrative',
      color: 'bg-indigo-100 text-indigo-800',
    },
    {
      id: 'audit-trail',
      name: 'System Audit Trail',
      description: 'Complete audit trail of system activities and changes',
      icon: DocumentTextIcon,
      category: 'audit',
      color: 'bg-red-100 text-red-800',
    },
  ];

  const categories = [
    { id: 'all', name: 'All Reports' },
    { id: 'financial', name: 'Financial' },
    { id: 'academic', name: 'Academic' },
    { id: 'administrative', name: 'Administrative' },
    { id: 'audit', name: 'Audit' },
  ];

  const filteredReports = reportTypes.filter(report => 
    selectedCategory === 'all' || report.category === selectedCategory
  );

  const handleGenerateReport = async (reportId: string) => {
    setIsLoading(true);
    try {
      let endpoint = '';
      switch (reportId) {
        case 'financial-summary':
          endpoint = '/reports/financial-summary';
          break;
        case 'payment-analysis':
          endpoint = '/reports/payment-analysis';
          break;
        case 'student-enrollment':
          endpoint = '/reports/student-enrollment';
          break;
        default:
          toast.error('Report type not implemented yet');
          return;
      }

      const response = await ApiService.get(endpoint);
      if (response.success) {
        const title = reportTypes.find(r => r.id === reportId)?.name || 'Generated Report';
        const report: GeneratedReport = {
          id: `${reportId}-${Date.now()}`,
          title,
          createdAt: new Date().toISOString(),
          payload: response.data,
        };
        setGeneratedReport(report);
        setIsModalOpen(true);
        toast.success(`${title} generated successfully!`);
      } else {
        toast.error(response.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Report generation error:', error);
      toast.error('Failed to generate report');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = (reportId: string, format: 'pdf' | 'excel' | 'csv') => {
    try {
      const title = reportTypes.find(r => r.id === reportId)?.name || 'report';
      const data = generatedReport?.payload;
      const filenameBase = `${title.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().slice(0,10)}`;

      if (format === 'csv' || format === 'excel') {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filenameBase}.${format === 'csv' ? 'csv' : 'xlsx'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      if (format === 'pdf') {
        const printable = document.getElementById('report-printable');
        if (!printable) {
          toast.error('No report to export. Generate a report first.');
          return;
        }
        const win = window.open('', 'PRINT', 'height=650,width=900,top=100,left=150');
        if (win) {
          win.document.write(`<html><head><title>${title}</title>`);
          win.document.write('</head><body >');
          win.document.write(printable.innerHTML);
          win.document.write('</body></html>');
          win.document.close();
          win.focus();
          win.print();
          win.close();
        }
      }
    } catch (e) {
      console.error('Export error:', e);
      toast.error('Failed to export report');
    }
  };

  // Show loading state if not authenticated
  if (!isAuthenticated || !user) {
    return <CenteredLoader />;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-400 dark:hover:text-white"
              >
                <HomeIcon className="w-4 h-4 mr-2" />
                Dashboard
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 dark:text-gray-400">
                  Reports
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Generate comprehensive reports and analytics for your school management system
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-8 bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                Report Filters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    School
                  </label>
                  <select
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={filters.school || ''}
                    onChange={(e) => setFilters({ ...filters, school: e.target.value })}
                    disabled={!user?.roles?.includes('Admin') || !!user?.school}
                  >
                    <option value="">
                      {user?.roles?.includes('Admin') && !user?.school ? 'All Schools' : 'Current School'}
                    </option>
                    {/* School options will be populated based on user's access level */}
                    {user?.school && (
                      <option value={typeof user.school === 'object' ? user.school._id : user.school}>
                        {typeof user.school === 'object' ? user.school.name : 'Current School'}
                      </option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Session
                  </label>
                  <select className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="">All Sessions</option>
                    <option value="2023-2024">2023/2024</option>
                    <option value="2022-2023">2022/2023</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Term
                  </label>
                  <select className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="">All Terms</option>
                    <option value="first">First Term</option>
                    <option value="second">Second Term</option>
                    <option value="third">Third Term</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date Range
                  </label>
                  <input
                    type="date"
                    className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    selectedCategory === category.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => {
            const IconComponent = report.icon;
            
            return (
              <div
                key={report.id}
                className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0">
                      <IconComponent className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {report.name}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${report.color}`}>
                        {report.category}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    {report.description}
                  </p>

                  <div className="space-y-3">
                    <button
                      onClick={() => handleGenerateReport(report.id)}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <DocumentTextIcon className="h-4 w-4 mr-2" />
                      Generate Report
                    </button>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleExportReport(report.id, 'pdf')}
                        className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                      >
                        PDF
                      </button>
                      <button
                        onClick={() => handleExportReport(report.id, 'excel')}
                        className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                      >
                        Excel
                      </button>
                      <button
                        onClick={() => handleExportReport(report.id, 'csv')}
                        className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                      >
                        CSV
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Report Preview Modal */}
        {isModalOpen && generatedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/40" onClick={() => setIsModalOpen(false)} />
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl mx-4 border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{generatedReport.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Generated {new Date(generatedReport.createdAt).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <div className="px-6 py-4 overflow-y-auto max-h-[60vh]" id="report-printable">
                <ReportContent data={generatedReport.payload} />
              </div>
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleExportReport(generatedReport.id.split('-')[0], 'pdf')}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  Export PDF
                </button>
                <button
                  onClick={() => handleExportReport(generatedReport.id.split('-')[0], 'excel')}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Export Excel
                </button>
                <button
                  onClick={() => handleExportReport(generatedReport.id.split('-')[0], 'csv')}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Export CSV
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No reports found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Try selecting a different category.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ReportsPage;
