# Smart-S Frontend Auditing Implementation Guide

## Auditing-Focused Component Architecture

### 1. Audit Dashboard Components

#### Main Audit Dashboard
```typescript
// src/components/audit/AuditDashboard.tsx
interface AuditDashboardProps {
  userRole: UserRole;
  schoolId?: string;
  dateRange: DateRange;
}

export const AuditDashboard: React.FC<AuditDashboardProps> = ({
  userRole,
  schoolId,
  dateRange
}) => {
  return (
    <div className="space-y-6">
      {/* Executive Summary Cards */}
      <AuditSummaryCards dateRange={dateRange} schoolId={schoolId} />
      
      {/* Real-time Alerts */}
      <AuditAlertsPanel />
      
      {/* Quick Access Audit Modules */}
      <AuditModulesGrid userRole={userRole} />
      
      {/* Recent Audit Activities */}
      <RecentAuditActivities limit={10} />
    </div>
  );
};
```

#### Financial Audit Trail Component
```typescript
// src/components/audit/FinancialAuditTrail.tsx
interface FinancialAuditTrailProps {
  filters: AuditFilters;
  onFilterChange: (filters: AuditFilters) => void;
}

export const FinancialAuditTrail: React.FC<FinancialAuditTrailProps> = ({
  filters,
  onFilterChange
}) => {
  const { data: auditData, isLoading } = useFinancialAuditTrail(filters);

  return (
    <div className="space-y-6">
      {/* Advanced Filters */}
      <AuditFiltersPanel 
        filters={filters} 
        onFilterChange={onFilterChange}
        filterTypes={['dateRange', 'transactionType', 'amountRange', 'user', 'school']}
      />
      
      {/* Audit Trail Table */}
      <AuditTrailTable 
        data={auditData?.transactions || []}
        loading={isLoading}
        onRowClick={handleTransactionDrillDown}
        columns={financialAuditColumns}
      />
      
      {/* Summary Statistics */}
      <AuditSummaryStats data={auditData?.summary} />
    </div>
  );
};
```

#### Payment Reconciliation Component
```typescript
// src/components/audit/PaymentReconciliation.tsx
interface PaymentReconciliationProps {
  sessionId: string;
  termId: string;
  schoolId: string;
}

export const PaymentReconciliation: React.FC<PaymentReconciliationProps> = ({
  sessionId,
  termId,
  schoolId
}) => {
  const { data: reconciliationData } = usePaymentReconciliation({
    sessionId,
    termId,
    schoolId
  });

  return (
    <div className="space-y-6">
      {/* Reconciliation Summary */}
      <ReconciliationSummaryCards data={reconciliationData?.summary} />
      
      {/* Discrepancies Alert */}
      {reconciliationData?.discrepancies?.length > 0 && (
        <DiscrepanciesAlert discrepancies={reconciliationData.discrepancies} />
      )}
      
      {/* Detailed Reconciliation Table */}
      <ReconciliationTable 
        data={reconciliationData?.details || []}
        onResolveDiscrepancy={handleResolveDiscrepancy}
      />
      
      {/* Export Options */}
      <ReconciliationExportPanel 
        sessionId={sessionId}
        termId={termId}
        schoolId={schoolId}
      />
    </div>
  );
};
```

### 2. Audit Data Visualization Components

#### Audit Charts Component
```typescript
// src/components/audit/AuditCharts.tsx
interface AuditChartsProps {
  data: AuditChartData;
  chartType: 'financial_trends' | 'payment_methods' | 'user_activities' | 'compliance_status';
}

export const AuditCharts: React.FC<AuditChartsProps> = ({ data, chartType }) => {
  const chartConfig = getChartConfig(chartType);
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{chartConfig.title}</h3>
        <ChartExportButton data={data} type={chartType} />
      </div>
      
      <div className="h-80">
        <Chart
          type={chartConfig.type}
          data={data}
          options={chartConfig.options}
        />
      </div>
      
      {/* Chart Insights */}
      <AuditInsights data={data} type={chartType} />
    </div>
  );
};
```

#### Audit Timeline Component
```typescript
// src/components/audit/AuditTimeline.tsx
interface AuditTimelineProps {
  events: AuditEvent[];
  entityId: string;
  entityType: 'payment' | 'fee' | 'user' | 'school';
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({
  events,
  entityId,
  entityType
}) => {
  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {events.map((event, eventIdx) => (
          <li key={event.id}>
            <div className="relative pb-8">
              {eventIdx !== events.length - 1 && (
                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
              )}
              
              <div className="relative flex space-x-3">
                <AuditEventIcon event={event} />
                
                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      {event.description}
                      <span className="font-medium text-gray-900 ml-1">
                        {event.performedBy}
                      </span>
                    </p>
                    
                    {event.changes && (
                      <AuditChangeDetails changes={event.changes} />
                    )}
                  </div>
                  
                  <div className="text-right text-sm whitespace-nowrap text-gray-500">
                    <time dateTime={event.timestamp}>
                      {formatAuditTimestamp(event.timestamp)}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
```

### 3. Audit Search and Filtering

#### Advanced Audit Search
```typescript
// src/components/audit/AuditSearch.tsx
interface AuditSearchProps {
  onSearch: (searchParams: AuditSearchParams) => void;
  searchTypes: AuditSearchType[];
}

export const AuditSearch: React.FC<AuditSearchProps> = ({
  onSearch,
  searchTypes
}) => {
  const [searchParams, setSearchParams] = useState<AuditSearchParams>({
    query: '',
    type: 'all',
    dateRange: { start: null, end: null },
    filters: {}
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-4">
      {/* Global Search */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <SearchInput
            value={searchParams.query}
            onChange={(query) => setSearchParams(prev => ({ ...prev, query }))}
            placeholder="Search transactions, users, fees..."
          />
        </div>
        
        <SearchTypeSelector
          value={searchParams.type}
          onChange={(type) => setSearchParams(prev => ({ ...prev, type }))}
          options={searchTypes}
        />
      </div>
      
      {/* Advanced Filters */}
      <Collapsible title="Advanced Filters">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DateRangePicker
            value={searchParams.dateRange}
            onChange={(dateRange) => setSearchParams(prev => ({ ...prev, dateRange }))}
          />
          
          <AmountRangeFilter
            value={searchParams.filters.amountRange}
            onChange={(amountRange) => 
              setSearchParams(prev => ({
                ...prev,
                filters: { ...prev.filters, amountRange }
              }))
            }
          />
          
          <UserSelector
            value={searchParams.filters.userId}
            onChange={(userId) =>
              setSearchParams(prev => ({
                ...prev,
                filters: { ...prev.filters, userId }
              }))
            }
          />
        </div>
      </Collapsible>
      
      {/* Search Actions */}
      <div className="flex justify-between">
        <Button
          variant="secondary"
          onClick={() => setSearchParams(initialSearchParams)}
        >
          Clear Filters
        </Button>
        
        <Button
          variant="primary"
          onClick={() => onSearch(searchParams)}
        >
          Search Audit Trail
        </Button>
      </div>
    </div>
  );
};
```

### 4. Audit Reporting Components

#### Audit Report Builder
```typescript
// src/components/audit/AuditReportBuilder.tsx
interface AuditReportBuilderProps {
  onGenerateReport: (config: AuditReportConfig) => void;
}

export const AuditReportBuilder: React.FC<AuditReportBuilderProps> = ({
  onGenerateReport
}) => {
  const [reportConfig, setReportConfig] = useState<AuditReportConfig>({
    type: 'financial_summary',
    dateRange: { start: null, end: null },
    scope: 'school',
    includeCharts: true,
    format: 'pdf'
  });

  return (
    <div className="space-y-6">
      {/* Report Type Selection */}
      <ReportTypeSelector
        value={reportConfig.type}
        onChange={(type) => setReportConfig(prev => ({ ...prev, type }))}
        options={auditReportTypes}
      />
      
      {/* Report Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <DateRangePicker
            label="Report Period"
            value={reportConfig.dateRange}
            onChange={(dateRange) => setReportConfig(prev => ({ ...prev, dateRange }))}
          />
          
          <ScopeSelector
            value={reportConfig.scope}
            onChange={(scope) => setReportConfig(prev => ({ ...prev, scope }))}
          />
        </div>
        
        <div className="space-y-4">
          <ReportOptionsPanel
            config={reportConfig}
            onChange={setReportConfig}
          />
          
          <FormatSelector
            value={reportConfig.format}
            onChange={(format) => setReportConfig(prev => ({ ...prev, format }))}
          />
        </div>
      </div>
      
      {/* Report Preview */}
      <ReportPreview config={reportConfig} />
      
      {/* Generate Report */}
      <div className="flex justify-end space-x-4">
        <Button
          variant="secondary"
          onClick={() => setReportConfig(defaultReportConfig)}
        >
          Reset
        </Button>
        
        <Button
          variant="primary"
          onClick={() => onGenerateReport(reportConfig)}
        >
          Generate Report
        </Button>
      </div>
    </div>
  );
};
```

### 5. Real-time Audit Monitoring

#### Audit Alerts Component
```typescript
// src/components/audit/AuditAlertsPanel.tsx
export const AuditAlertsPanel: React.FC = () => {
  const { data: alerts } = useAuditAlerts();
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  const activeAlerts = alerts?.filter(alert => 
    !dismissedAlerts.includes(alert.id)
  ) || [];

  return (
    <div className="space-y-4">
      {activeAlerts.map(alert => (
        <AuditAlert
          key={alert.id}
          alert={alert}
          onDismiss={() => setDismissedAlerts(prev => [...prev, alert.id])}
          onInvestigate={() => handleInvestigateAlert(alert)}
        />
      ))}
      
      {activeAlerts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <CheckCircleIcon className="mx-auto h-12 w-12 text-green-400" />
          <p className="mt-2">No active audit alerts</p>
        </div>
      )}
    </div>
  );
};
```

### 6. Audit Data Hooks

#### Custom Hooks for Audit Data
```typescript
// src/hooks/useAuditData.ts
export const useFinancialAuditTrail = (filters: AuditFilters) => {
  return useQuery({
    queryKey: ['audit', 'financial', filters],
    queryFn: () => auditService.getFinancialAuditTrail(filters),
    keepPreviousData: true,
    staleTime: 30000, // 30 seconds
  });
};

export const usePaymentReconciliation = (params: ReconciliationParams) => {
  return useQuery({
    queryKey: ['audit', 'reconciliation', params],
    queryFn: () => auditService.getPaymentReconciliation(params),
    enabled: !!(params.sessionId && params.termId && params.schoolId),
  });
};

export const useAuditAlerts = () => {
  return useQuery({
    queryKey: ['audit', 'alerts'],
    queryFn: auditService.getAuditAlerts,
    refetchInterval: 60000, // Refresh every minute
  });
};

export const useUserActivityAudit = (userId: string, filters?: ActivityFilters) => {
  return useQuery({
    queryKey: ['audit', 'user-activity', userId, filters],
    queryFn: () => auditService.getUserActivityAudit(userId, filters),
    enabled: !!userId,
  });
};
```

### 7. Audit Service Layer

#### Audit API Service
```typescript
// src/services/auditService.ts
class AuditService {
  async getFinancialAuditTrail(filters: AuditFilters): Promise<FinancialAuditData> {
    const response = await apiClient.get('/audit/financial/transactions', {
      params: filters
    });
    return response.data;
  }

  async getPaymentReconciliation(params: ReconciliationParams): Promise<ReconciliationData> {
    const response = await apiClient.get('/audit/financial/reconciliation', {
      params
    });
    return response.data;
  }

  async getUserActivityAudit(userId: string, filters?: ActivityFilters): Promise<UserActivityData> {
    const response = await apiClient.get(`/audit/users/${userId}/activities`, {
      params: filters
    });
    return response.data;
  }

  async generateAuditReport(config: AuditReportConfig): Promise<AuditReport> {
    const response = await apiClient.post('/audit/reports/generate', config);
    return response.data;
  }

  async getAuditAlerts(): Promise<AuditAlert[]> {
    const response = await apiClient.get('/audit/alerts');
    return response.data;
  }

  async exportAuditData(params: ExportParams): Promise<Blob> {
    const response = await apiClient.get('/audit/export', {
      params,
      responseType: 'blob'
    });
    return response.data;
  }
}

export const auditService = new AuditService();
```

This comprehensive auditing frontend implementation ensures that the Smart-S system provides industry-leading audit capabilities with real-time monitoring, detailed trail tracking, and comprehensive reporting features.
