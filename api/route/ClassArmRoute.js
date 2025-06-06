const express = require('express')
const router = express.Router()
const authenticateToken = require('../middleware/authenticateToken')
const roleList = require('../helpers/roleList')
const verifyRoles = require('../middleware/verifyRoles')
const classArmController = require('../controller/ClassArm_view')

router
  .route('/all')
  .get(
    authenticateToken,
    verifyRoles(
      roleList.Admin,
      roleList.ICT_administrator,
      roleList.Proprietor,
      roleList.Principal
    ),
    classArmController.getAllClassArms
  )
router
  .route('/:id')
  .get(
    authenticateToken,
    verifyRoles(
      roleList.Admin,
      roleList.ICT_administrator,
      roleList.Proprietor,
      roleList.Principal
    ),
    classArmController.getClassArmById
  )
router
  .route('/')
  .post(
    authenticateToken,
    verifyRoles(
      roleList.Admin,
      roleList.ICT_administrator,
      roleList.Proprietor,
      roleList.Principal
    ),
    classArmController.createClassArm
  )
router
  .route('/:id/update')
  .put(
    authenticateToken,
    verifyRoles(
      roleList.Admin,
      roleList.ICT_administrator,
      roleList.Proprietor,
      roleList.Principal
    ),
    classArmController.updateClassArm
  )
router
  .route('/:id/delete')
  .delete(
    authenticateToken,
    verifyRoles(
      roleList.Admin,
      roleList.ICT_administrator,
      roleList.Proprietor,
      roleList.Principal
    ),
    classArmController.deleteClassArm
  )

// Student count management routes
router
  .route('/:id/update-student-count')
  .put(
    authenticateToken,
    verifyRoles(
      roleList.Admin,
      roleList.ICT_administrator,
      roleList.Proprietor,
      roleList.Principal
    ),
    classArmController.updateClassArmStudentCount
  )

router
  .route('/update-all-student-counts')
  .put(
    authenticateToken,
    verifyRoles(
      roleList.Admin,
      roleList.ICT_administrator,
      roleList.Proprietor
    ),
    classArmController.updateAllClassArmsStudentCount
  )

router
  .route('/:id/student-count')
  .get(
    authenticateToken,
    verifyRoles(
      roleList.Admin,
      roleList.ICT_administrator,
      roleList.Proprietor,
      roleList.Principal,
      roleList.Headteacher
    ),
    classArmController.getClassArmWithStudentCount
  )

module.exports = router
