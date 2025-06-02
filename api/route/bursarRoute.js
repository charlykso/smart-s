const express = require('express');
const bursarController = require('../controller/bursar_view');
const authenticateToken = require('../middleware/authenticateToken');
const roleList = require('../helpers/roleList');
const verifyRoles = require('../middleware/verifyRoles');

const router = express.Router();

// Bursar dashboard data
router.get('/dashboard', 
  authenticateToken,
  verifyRoles(roleList.Bursar),
  bursarController.getBursarDashboard
);

// Payment reports
router.get('/payment-reports', 
  authenticateToken,
  verifyRoles(roleList.Bursar),
  bursarController.getPaymentReports
);

// Outstanding fees report
router.get('/outstanding-fees-report', 
  authenticateToken,
  verifyRoles(roleList.Bursar),
  bursarController.getOutstandingFeesReport
);

module.exports = router;
