const express = require('express');
const principalController = require('../controller/principal_view');
const authenticateToken = require('../middleware/authenticateToken');
const roleList = require('../helpers/roleList');
const verifyRoles = require('../middleware/verifyRoles');

const router = express.Router();

// Principal dashboard data
router.get('/dashboard', 
  authenticateToken,
  verifyRoles(roleList.Principal),
  principalController.getPrincipalDashboard
);

// Academic overview
router.get('/academic-overview', 
  authenticateToken,
  verifyRoles(roleList.Principal),
  principalController.getAcademicOverview
);

// Staff management
router.get('/staff-management', 
  authenticateToken,
  verifyRoles(roleList.Principal),
  principalController.getStaffManagement
);

module.exports = router;
