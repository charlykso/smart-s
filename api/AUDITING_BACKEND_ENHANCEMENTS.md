# Smart-S Backend Auditing System Enhancements

## Current Auditing Capabilities Analysis

### Existing Audit Features
Based on the current API structure:
- ✅ Payment audit by user (`/audit/user/:user_id`)
- ✅ Payment audit by user and term (`/audit/user/:user_id/term/:term_id`)
- ✅ Payment audit by user and session (`/audit/user/:user_id/session/:session_id`)
- ✅ Basic payment tracking with transaction references
- ✅ Payment status monitoring (pending, success, failed)

### Missing Critical Audit Features
- ❌ Comprehensive transaction audit trail
- ❌ User activity logging and tracking
- ❌ Security event monitoring
- ❌ Fee management audit trail
- ❌ Administrative action logging
- ❌ Real-time audit alerts
- ❌ Compliance reporting
- ❌ Data integrity verification

## Required Database Schema Enhancements

### 1. Enhanced Audit Tables

#### audit_transactions Table
```javascript
// models/AuditTransaction.js
const mongoose = require('mongoose');

const auditTransactionSchema = new mongoose.Schema({
  transactionType: {
    type: String,
    enum: ['payment', 'fee_creation', 'fee_approval', 'fee_modification', 'refund', 'adjustment'],
    required: true
  },
  entityId: { type: String, required: true }, // Payment ID, Fee ID, etc.
  entityType: { type: String, required: true },
  
  // User and Context
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
  term: { type: mongoose.Schema.Types.ObjectId, ref: 'Term' },
  
  // Financial Details
  amount: { type: Number },
  currency: { type: String, default: 'NGN' },
  previousAmount: { type: Number }, // For modifications
  
  // Audit Metadata
  timestamp: { type: Date, default: Date.now, required: true },
  ipAddress: { type: String },
  userAgent: { type: String },
  actionDescription: { type: String, required: true },
  
  // Change Tracking
  fieldChanges: [{
    field: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed
  }],
  
  // References
  relatedTransactions: [{ type: String }],
  documentReferences: [{ type: String }],
  
  // Approval Chain
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvalTimestamp: { type: Date },
  approvalComments: { type: String },
  
  // Risk Assessment
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  flaggedForReview: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Indexes for performance
auditTransactionSchema.index({ performedBy: 1, timestamp: -1 });
auditTransactionSchema.index({ school: 1, timestamp: -1 });
auditTransactionSchema.index({ transactionType: 1, timestamp: -1 });
auditTransactionSchema.index({ entityId: 1, entityType: 1 });

module.exports = mongoose.model('AuditTransaction', auditTransactionSchema);
```

#### audit_user_activities Table
```javascript
// models/AuditUserActivity.js
const auditUserActivitySchema = new mongoose.Schema({
  // Who performed the action
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Who/what was affected
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  targetEntity: {
    type: { type: String }, // 'User', 'School', 'Fee', etc.
    id: { type: String }
  },
  
  // Action Details
  action: { type: String, required: true },
  module: {
    type: String,
    enum: ['user_management', 'school_management', 'fee_management', 'payment_processing', 'reports', 'settings'],
    required: true
  },
  
  // Session Information
  sessionId: { type: String },
  ipAddress: { type: String },
  userAgent: { type: String },
  timestamp: { type: Date, default: Date.now, required: true },
  
  // Detailed Action Data
  actionData: {
    description: { type: String, required: true },
    changes: [{
      field: String,
      oldValue: mongoose.Schema.Types.Mixed,
      newValue: mongoose.Schema.Types.Mixed
    }],
    metadata: { type: mongoose.Schema.Types.Mixed }
  },
  
  // Risk Assessment
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  requiresReview: { type: Boolean, default: false },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewTimestamp: { type: Date },
  reviewNotes: { type: String }
}, {
  timestamps: true
});

auditUserActivitySchema.index({ performedBy: 1, timestamp: -1 });
auditUserActivitySchema.index({ module: 1, timestamp: -1 });
auditUserActivitySchema.index({ riskLevel: 1, requiresReview: 1 });

module.exports = mongoose.model('AuditUserActivity', auditUserActivitySchema);
```

#### audit_security_events Table
```javascript
// models/AuditSecurityEvent.js
const auditSecurityEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    enum: ['login', 'logout', 'failed_login', 'password_change', 'role_change', 'permission_escalation', 'suspicious_activity'],
    required: true
  },
  
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ipAddress: { type: String, required: true },
  userAgent: { type: String },
  timestamp: { type: Date, default: Date.now, required: true },
  
  // Session Context
  sessionId: { type: String },
  attemptCount: { type: Number, default: 1 },
  successfulLogin: { type: Boolean },
  
  // Geolocation (if available)
  location: {
    country: String,
    city: String,
    coordinates: [Number] // [longitude, latitude]
  },
  
  // Security Analysis
  suspiciousActivity: { type: Boolean, default: false },
  riskFactors: [{ type: String }],
  actionTaken: { type: String },
  
  // Additional Context
  eventData: { type: mongoose.Schema.Types.Mixed }
}, {
  timestamps: true
});

auditSecurityEventSchema.index({ user: 1, timestamp: -1 });
auditSecurityEventSchema.index({ eventType: 1, timestamp: -1 });
auditSecurityEventSchema.index({ suspiciousActivity: 1, timestamp: -1 });
auditSecurityEventSchema.index({ ipAddress: 1, timestamp: -1 });

module.exports = mongoose.model('AuditSecurityEvent', auditSecurityEventSchema);
```

## Enhanced API Endpoints

### 1. Financial Audit Endpoints

```javascript
// routes/audit.js - Enhanced financial audit routes

// Get comprehensive financial audit trail
router.get('/financial/transactions', authenticateToken, verifyRoles(['Admin', 'Auditor', 'Principal', 'Bursar']), async (req, res) => {
  try {
    const {
      school_id,
      session_id,
      term_id,
      user_id,
      transaction_type,
      date_from,
      date_to,
      amount_min,
      amount_max,
      page = 1,
      limit = 50
    } = req.query;

    const filter = {};
    
    if (school_id) filter.school = school_id;
    if (session_id) filter.session = session_id;
    if (term_id) filter.term = term_id;
    if (user_id) filter.performedBy = user_id;
    if (transaction_type) filter.transactionType = transaction_type;
    
    if (date_from || date_to) {
      filter.timestamp = {};
      if (date_from) filter.timestamp.$gte = new Date(date_from);
      if (date_to) filter.timestamp.$lte = new Date(date_to);
    }
    
    if (amount_min || amount_max) {
      filter.amount = {};
      if (amount_min) filter.amount.$gte = parseFloat(amount_min);
      if (amount_max) filter.amount.$lte = parseFloat(amount_max);
    }

    const skip = (page - 1) * limit;
    
    const [transactions, total] = await Promise.all([
      AuditTransaction.find(filter)
        .populate('performedBy', 'firstname lastname email')
        .populate('school', 'name')
        .populate('session', 'name')
        .populate('term', 'name')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      AuditTransaction.countDocuments(filter)
    ]);

    // Calculate summary statistics
    const summary = await AuditTransaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' },
          transactionTypes: { $addToSet: '$transactionType' }
        }
      }
    ]);

    res.json({
      transactions,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: total
      },
      summary: summary[0] || {}
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching financial audit trail', error: error.message });
  }
});

// Get payment reconciliation report
router.get('/financial/reconciliation', authenticateToken, verifyRoles(['Admin', 'Auditor', 'Principal', 'Bursar']), async (req, res) => {
  try {
    const { school_id, session_id, term_id } = req.query;

    if (!school_id || !session_id || !term_id) {
      return res.status(400).json({ message: 'School ID, Session ID, and Term ID are required' });
    }

    // Get all fees for the term
    const fees = await Fee.find({
      school: school_id,
      term: term_id,
      isActive: true
    }).populate('term session');

    // Get all payments for the term
    const payments = await Payment.find({
      'fee.school': school_id,
      'fee.term': term_id
    }).populate('fee user');

    // Calculate reconciliation data
    const reconciliation = await calculateReconciliation(fees, payments);

    res.json(reconciliation);
  } catch (error) {
    res.status(500).json({ message: 'Error generating reconciliation report', error: error.message });
  }
});
```

### 2. User Activity Audit Endpoints

```javascript
// Get user activity audit trail
router.get('/users/:user_id/activities', authenticateToken, verifyRoles(['Admin', 'Auditor', 'Principal']), async (req, res) => {
  try {
    const { user_id } = req.params;
    const { date_from, date_to, module, risk_level, page = 1, limit = 50 } = req.query;

    const filter = { performedBy: user_id };
    
    if (module) filter.module = module;
    if (risk_level) filter.riskLevel = risk_level;
    
    if (date_from || date_to) {
      filter.timestamp = {};
      if (date_from) filter.timestamp.$gte = new Date(date_from);
      if (date_to) filter.timestamp.$lte = new Date(date_to);
    }

    const skip = (page - 1) * limit;
    
    const activities = await AuditUserActivity.find(filter)
      .populate('performedBy', 'firstname lastname email')
      .populate('targetUser', 'firstname lastname email')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AuditUserActivity.countDocuments(filter);

    res.json({
      activities,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user activities', error: error.message });
  }
});

// Get high-risk activities requiring review
router.get('/admin/high-risk', authenticateToken, verifyRoles(['Admin', 'Auditor']), async (req, res) => {
  try {
    const { reviewed = false, risk_level = 'high' } = req.query;

    const filter = {
      riskLevel: { $in: risk_level === 'high' ? ['high', 'critical'] : [risk_level] },
      requiresReview: true
    };

    if (reviewed === 'true') {
      filter.reviewedBy = { $exists: true };
    } else if (reviewed === 'false') {
      filter.reviewedBy = { $exists: false };
    }

    const activities = await AuditUserActivity.find(filter)
      .populate('performedBy', 'firstname lastname email roles')
      .populate('targetUser', 'firstname lastname email')
      .populate('reviewedBy', 'firstname lastname email')
      .sort({ timestamp: -1 })
      .limit(100);

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching high-risk activities', error: error.message });
  }
});
```

### 3. Security Audit Endpoints

```javascript
// Get security events audit
router.get('/security/events', authenticateToken, verifyRoles(['Admin', 'ICT_administrator', 'Auditor']), async (req, res) => {
  try {
    const { user_id, event_type, suspicious_only, date_from, date_to, page = 1, limit = 50 } = req.query;

    const filter = {};
    
    if (user_id) filter.user = user_id;
    if (event_type) filter.eventType = event_type;
    if (suspicious_only === 'true') filter.suspiciousActivity = true;
    
    if (date_from || date_to) {
      filter.timestamp = {};
      if (date_from) filter.timestamp.$gte = new Date(date_from);
      if (date_to) filter.timestamp.$lte = new Date(date_to);
    }

    const skip = (page - 1) * limit;
    
    const events = await AuditSecurityEvent.find(filter)
      .populate('user', 'firstname lastname email')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AuditSecurityEvent.countDocuments(filter);

    res.json({
      events,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching security events', error: error.message });
  }
});
```

## Audit Middleware Implementation

### 1. Transaction Audit Middleware

```javascript
// middleware/auditMiddleware.js
const AuditTransaction = require('../models/AuditTransaction');
const AuditUserActivity = require('../models/AuditUserActivity');

const auditTransaction = (transactionType, entityType) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log the transaction after successful response
      if (res.statusCode >= 200 && res.statusCode < 300) {
        logAuditTransaction(req, transactionType, entityType, data);
      }
      originalSend.call(this, data);
    };
    
    next();
  };
};

const logAuditTransaction = async (req, transactionType, entityType, responseData) => {
  try {
    const auditData = {
      transactionType,
      entityType,
      entityId: extractEntityId(req, responseData),
      performedBy: req.user.Id,
      school: extractSchoolId(req),
      session: extractSessionId(req),
      term: extractTermId(req),
      amount: extractAmount(req),
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      actionDescription: generateActionDescription(transactionType, req),
      fieldChanges: extractFieldChanges(req)
    };

    await AuditTransaction.create(auditData);
  } catch (error) {
    console.error('Error logging audit transaction:', error);
  }
};

module.exports = { auditTransaction };
```

### 2. User Activity Audit Middleware

```javascript
const auditUserActivity = (module, action) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        logUserActivity(req, module, action, data);
      }
      originalSend.call(this, data);
    };
    
    next();
  };
};

const logUserActivity = async (req, module, action, responseData) => {
  try {
    const activityData = {
      performedBy: req.user.Id,
      targetUser: extractTargetUserId(req),
      action,
      module,
      sessionId: req.sessionID,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date(),
      actionData: {
        description: generateActionDescription(action, req),
        changes: extractFieldChanges(req),
        metadata: extractMetadata(req, responseData)
      },
      riskLevel: assessRiskLevel(action, req.user.roles, req.body),
      requiresReview: shouldRequireReview(action, req.user.roles)
    };

    await AuditUserActivity.create(activityData);
  } catch (error) {
    console.error('Error logging user activity:', error);
  }
};
```

This comprehensive backend enhancement ensures that the Smart-S auditing system captures every critical action and provides the detailed audit trail necessary for financial accountability and compliance in educational institutions.
