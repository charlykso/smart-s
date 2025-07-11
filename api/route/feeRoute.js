const express = require('express')
const feeController = require('../controller/Fee_view')
const {
  authenticateToken,
  filterByUserSchool,
  enforceSchoolBoundary,
} = require('../middleware/auth')
const roleList = require('../helpers/roleList')
const verifyRoles = require('../middleware/verifyRoles')
const router = express.Router()

router.get('/all', authenticateToken, filterByUserSchool, feeController.getFees)
router
  .route('/get-approved-fees')
  .get(
    authenticateToken,
    verifyRoles(
      roleList.Bursar,
      roleList.Principal,
      roleList.Admin,
      roleList.ICT_administrator,
      roleList.Student
    ),
    filterByUserSchool,
    feeController.getApprovedFees
  ) //Bursar, principal, ICT_administrator, and students
router
  .route('/get-unapproved-fees')
  .get(
    authenticateToken,
    verifyRoles(
      roleList.Bursar,
      roleList.Principal,
      roleList.Admin,
      roleList.ICT_administrator
    ),
    filterByUserSchool,
    feeController.getUnapprovedFees
  ) //Bursar, principal, and ICT_administrator

router.get('/:id', authenticateToken, filterByUserSchool, feeController.getFee)

router.post(
  '/create',
  authenticateToken,
  verifyRoles(roleList.Bursar, roleList.Admin),
  enforceSchoolBoundary,
  feeController.createFee
) //Bursar

router
  .route('/:id/update')
  .put(
    authenticateToken,
    verifyRoles(roleList.Bursar, roleList.Admin),
    enforceSchoolBoundary,
    feeController.updateFee
  ) //Bursar
router
  .route('/:id/delete')
  .delete(
    authenticateToken,
    verifyRoles(roleList.Bursar, roleList.Admin),
    enforceSchoolBoundary,
    feeController.deleteFee
  ) //Bursar

router.get(
  '/term/:term_id',
  authenticateToken,
  filterByUserSchool,
  feeController.getFeesByTerm
)

router
  .route('/:term_id/get-approved-fees')
  .get(
    authenticateToken,
    verifyRoles(roleList.Bursar, roleList.Principal, roleList.Admin),
    feeController.getApprovedFeesByTerm
  )

router
  .route('/:term_id/get-unapproved-fees')
  .get(
    authenticateToken,
    verifyRoles(roleList.Bursar, roleList.Principal, roleList.Admin),
    feeController.getUnapprovedFeesByTerm
  )

router
  .route('/school/:school_id')
  .get(
    authenticateToken,
    verifyRoles(roleList.Principal, roleList.Admin),
    feeController.approvedFeesForASchool
  )
router
  .route('/school/:school_id/get-unapproved-fees')
  .get(
    authenticateToken,
    verifyRoles(roleList.Principal, roleList.Admin),
    feeController.unapprovedFeesForASchool
  )

router
  .route('/school/:school_id/get')
  .get(
    authenticateToken,
    verifyRoles(roleList.Bursar, roleList.Principal, roleList.Admin),
    feeController.getFeesBySchool
  )

// Student-specific endpoint to get approved fees from their school
router
  .route('/student/approved-fees')
  .get(
    authenticateToken,
    verifyRoles(roleList.Student),
    enforceSchoolBoundary,
    feeController.getApprovedFeesForStudent
  )

module.exports = router
