const express = require('express');
const adminController = require('../controller/admin_view');
const authenticateToken = require('../middleware/authenticateToken');
const roleList = require('../helpers/roleList');
const verifyRoles = require('../middleware/verifyRoles');

const router = express.Router();

// Admin dashboard data
router.get('/dashboard', 
  authenticateToken,
  verifyRoles(roleList.Admin),
  adminController.getAdminDashboard
);

// System overview
router.get('/system-overview', 
  authenticateToken,
  verifyRoles(roleList.Admin),
  adminController.getSystemOverview
);

// User management
router.get('/user-management', 
  authenticateToken,
  verifyRoles(roleList.Admin),
  adminController.getUserManagement
);

// Financial overview
router.get('/financial-overview', 
  authenticateToken,
  verifyRoles(roleList.Admin),
  adminController.getFinancialOverview
);

module.exports = router;
