# Ledgrio Auditing System - Comprehensive Specification

## Overview

The Ledgrio auditing system is the core feature designed to provide comprehensive financial tracking, compliance monitoring, and accountability for educational institutions. This system ensures complete transparency and traceability of all financial transactions and administrative actions.

## Current API Auditing Capabilities

### Existing Audit Endpoints

Based on the current API analysis:

1. **Payment Auditing by User**

   - `GET /api/v1/audit/user/:user_id` - All payments by specific user
   - `GET /api/v1/audit/user/:user_id/term/:term_id` - User payments for specific term
   - `GET /api/v1/audit/user/:user_id/session/:session_id` - User payments for specific session

2. **Payment Tracking Features**
   - Complete payment history with transaction references
   - Payment method tracking (Paystack, cash, bank transfer)
   - Payment status monitoring (pending, success, failed)
   - Installment payment tracking
   - Fee approval workflow audit trail

## Enhanced Auditing System Requirements

### 1. Financial Audit Trail

#### Transaction-Level Auditing

```typescript
interface AuditTransaction {
  id: string
  transactionType:
    | 'payment'
    | 'fee_creation'
    | 'fee_approval'
    | 'refund'
    | 'adjustment'
  entityId: string // Payment ID, Fee ID, etc.
  userId: string // Who performed the action
  schoolId: string
  sessionId: string
  termId: string

  // Financial Details
  amount: number
  currency: string
  previousAmount?: number // For modifications

  // Audit Metadata
  timestamp: Date
  ipAddress: string
  userAgent: string
  actionDescription: string

  // References
  relatedTransactions: string[] // Related audit entries
  documentReferences: string[] // Receipt, invoice IDs

  // Approval Chain
  approvalStatus: 'pending' | 'approved' | 'rejected'
  approvedBy?: string
  approvalTimestamp?: Date
  approvalComments?: string
}
```

#### Fee Management Audit

```typescript
interface FeeAuditEntry {
  id: string
  feeId: string
  action:
    | 'created'
    | 'modified'
    | 'approved'
    | 'rejected'
    | 'activated'
    | 'deactivated'
  performedBy: string
  timestamp: Date

  // Change Details
  fieldChanges: {
    field: string
    oldValue: any
    newValue: any
  }[]

  // Approval Workflow
  approvalLevel: number
  requiredApprovals: string[] // Role names
  currentApprovals: {
    userId: string
    role: string
    timestamp: Date
    decision: 'approved' | 'rejected'
    comments?: string
  }[]

  // Impact Analysis
  affectedStudents: number
  totalFinancialImpact: number
}
```

### 2. User Activity Auditing

#### Administrative Actions

```typescript
interface UserAuditEntry {
  id: string
  userId: string // Who performed the action
  targetUserId?: string // Who was affected (for user management)
  action: string
  module:
    | 'user_management'
    | 'school_management'
    | 'fee_management'
    | 'payment_processing'
    | 'reports'

  // Session Information
  sessionId: string
  ipAddress: string
  userAgent: string
  timestamp: Date

  // Action Details
  actionData: {
    description: string
    entityType: string
    entityId: string
    changes?: Record<string, { old: any; new: any }>
  }

  // Risk Assessment
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  requiresReview: boolean
  reviewedBy?: string
  reviewTimestamp?: Date
}
```

### 3. System-Level Auditing

#### Security Events

```typescript
interface SecurityAuditEntry {
  id: string
  eventType:
    | 'login'
    | 'logout'
    | 'failed_login'
    | 'password_change'
    | 'role_change'
    | 'permission_escalation'
  userId?: string
  ipAddress: string
  userAgent: string
  timestamp: Date

  // Security Context
  sessionId?: string
  attemptCount?: number // For failed logins
  successfulLogin: boolean

  // Geolocation (if available)
  location?: {
    country: string
    city: string
    coordinates?: [number, number]
  }

  // Risk Indicators
  suspiciousActivity: boolean
  riskFactors: string[]
  actionTaken?: string
}
```

## Auditing Database Schema Enhancements

### New Audit Tables Required

#### 1. audit_transactions

```sql
CREATE TABLE audit_transactions (
  id VARCHAR(255) PRIMARY KEY,
  transaction_type ENUM('payment', 'fee_creation', 'fee_approval', 'refund', 'adjustment'),
  entity_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  school_id VARCHAR(255) NOT NULL,
  session_id VARCHAR(255),
  term_id VARCHAR(255),

  amount DECIMAL(15,2),
  currency VARCHAR(3) DEFAULT 'NGN',
  previous_amount DECIMAL(15,2),

  timestamp DATETIME NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  action_description TEXT,

  related_transactions JSON,
  document_references JSON,

  approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  approved_by VARCHAR(255),
  approval_timestamp DATETIME,
  approval_comments TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_user_id (user_id),
  INDEX idx_school_id (school_id),
  INDEX idx_timestamp (timestamp),
  INDEX idx_transaction_type (transaction_type)
);
```

#### 2. audit_user_activities

```sql
CREATE TABLE audit_user_activities (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  target_user_id VARCHAR(255),
  action VARCHAR(255) NOT NULL,
  module ENUM('user_management', 'school_management', 'fee_management', 'payment_processing', 'reports'),

  session_id VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  timestamp DATETIME NOT NULL,

  action_data JSON,

  risk_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low',
  requires_review BOOLEAN DEFAULT FALSE,
  reviewed_by VARCHAR(255),
  review_timestamp DATETIME,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_user_id (user_id),
  INDEX idx_timestamp (timestamp),
  INDEX idx_module (module),
  INDEX idx_risk_level (risk_level)
);
```

#### 3. audit_security_events

```sql
CREATE TABLE audit_security_events (
  id VARCHAR(255) PRIMARY KEY,
  event_type ENUM('login', 'logout', 'failed_login', 'password_change', 'role_change', 'permission_escalation'),
  user_id VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  timestamp DATETIME NOT NULL,

  session_id VARCHAR(255),
  attempt_count INT DEFAULT 1,
  successful_login BOOLEAN,

  location_data JSON,

  suspicious_activity BOOLEAN DEFAULT FALSE,
  risk_factors JSON,
  action_taken TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_user_id (user_id),
  INDEX idx_timestamp (timestamp),
  INDEX idx_event_type (event_type),
  INDEX idx_suspicious (suspicious_activity)
);
```

## API Endpoints for Enhanced Auditing

### Financial Audit Endpoints

```typescript
// Get comprehensive financial audit trail
GET /api/v1/audit/financial/transactions
Query Parameters:
- school_id: string
- session_id?: string
- term_id?: string
- user_id?: string
- transaction_type?: string
- date_from?: string
- date_to?: string
- amount_min?: number
- amount_max?: number
- page?: number
- limit?: number

// Get fee management audit trail
GET /api/v1/audit/fees/:fee_id/history

// Get payment reconciliation report
GET /api/v1/audit/financial/reconciliation
Query Parameters:
- school_id: string
- session_id: string
- term_id: string

// Get outstanding fees audit
GET /api/v1/audit/financial/outstanding
Query Parameters:
- school_id: string
- session_id?: string
- term_id?: string
```

### User Activity Audit Endpoints

```typescript
// Get user activity audit trail
GET /api/v1/audit/users/:user_id/activities
Query Parameters:
- date_from?: string
- date_to?: string
- module?: string
- risk_level?: string

// Get administrative actions audit
GET /api/v1/audit/admin/actions
Query Parameters:
- school_id?: string
- performed_by?: string
- module?: string
- date_from?: string
- date_to?: string

// Get high-risk activities requiring review
GET /api/v1/audit/admin/high-risk
Query Parameters:
- reviewed?: boolean
- risk_level?: string
```

### Security Audit Endpoints

```typescript
// Get security events audit
GET /api/v1/audit/security/events
Query Parameters:
- user_id?: string
- event_type?: string
- suspicious_only?: boolean
- date_from?: string
- date_to?: string

// Get failed login attempts
GET /api/v1/audit/security/failed-logins
Query Parameters:
- ip_address?: string
- date_from?: string
- date_to?: string

// Get session audit trail
GET /api/v1/audit/security/sessions/:session_id
```

## Compliance and Reporting Features

### 1. Regulatory Compliance Reports

- **Financial Transparency Reports**: Complete transaction history with approval chains
- **Student Fee Compliance**: Verification that all fees are properly authorized and collected
- **Payment Method Compliance**: Tracking of all payment channels and their compliance status
- **Data Protection Audit**: User data access and modification tracking

### 2. Real-time Monitoring

- **Suspicious Activity Detection**: Automated flagging of unusual patterns
- **Approval Workflow Monitoring**: Tracking of pending approvals and bottlenecks
- **Financial Discrepancy Alerts**: Automatic detection of payment mismatches
- **User Behavior Analytics**: Pattern recognition for security threats

### 3. Audit Dashboard Features

- **Executive Summary**: High-level financial and operational metrics
- **Drill-down Capabilities**: From summary to transaction-level details
- **Comparative Analysis**: Period-over-period comparisons
- **Exception Reporting**: Automated identification of anomalies
- **Compliance Status**: Real-time compliance monitoring dashboard

## Implementation Priority for Frontend

### Phase 1: Core Audit Infrastructure (Week 1-2)

1. Audit data models and API integration
2. Basic audit trail components
3. Financial transaction tracking
4. User activity logging

### Phase 2: Advanced Auditing Features (Week 3-4)

1. Comprehensive audit dashboard
2. Advanced filtering and search
3. Drill-down capabilities
4. Export functionality

### Phase 3: Compliance and Reporting (Week 5-6)

1. Regulatory compliance reports
2. Real-time monitoring alerts
3. Automated anomaly detection
4. Executive reporting dashboards

This enhanced auditing system ensures that Smart-S provides industry-leading financial transparency and accountability for educational institutions.
