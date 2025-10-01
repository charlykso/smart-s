const express = require('express');
const parentController = require('../controller/parent_view');
const authenticateToken = require('../middleware/authenticateToken');
const roleList = require('../helpers/roleList');
const verifyRoles = require('../middleware/verifyRoles');

const router = express.Router();

// Parent dashboard data
router.get('/dashboard', 
  authenticateToken,
  verifyRoles(roleList.Parent),
  parentController.getParentDashboard
);

// Child details
router.get('/child/:childId', 
  authenticateToken,
  verifyRoles(roleList.Parent),
  parentController.getChildDetails
);

// Payment history
router.get('/payment-history', 
  authenticateToken,
  verifyRoles(roleList.Parent),
  parentController.getPaymentHistory
);

// Initiate payment for a child (parent-initiated)
router.post('/pay',
  authenticateToken,
  verifyRoles(roleList.Parent),
  parentController.initiateChildPayment
);

module.exports = router;
