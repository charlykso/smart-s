const express = require('express')
const router = express.Router()
const termController = require('../controller/Term_view')
const authenticateToken = require('../middleware/authenticateToken')
const { filterByUserSchool } = require('../middleware/auth')
const verifyRoles = require('../middleware/verifyRoles')
const roleList = require('../helpers/roleList')

router
  .route('/all')
  .get(
    authenticateToken,
    verifyRoles(
      roleList.Admin,
      roleList.Principal,
      roleList.Proprietor,
      roleList.Bursar,
      roleList.ICT_administrator,
      roleList.Teacher,
      roleList.Student
    ),
    filterByUserSchool,
    termController.getAllTerms
  )
router
  .route('/:id')
  .get(
    authenticateToken,
    verifyRoles(
      roleList.Admin,
      roleList.Principal,
      roleList.Proprietor,
      roleList.ICT_administrator
    ),
    termController.getTermById
  )
router
  .route('/create')
  .post(
    authenticateToken,
    verifyRoles(
      roleList.Admin,
      roleList.ICT_administrator,
      roleList.Principal,
      roleList.Proprietor
    ),
    termController.createTerm
  )
router
  .route('/:id/update')
  .put(
    authenticateToken,
    verifyRoles(
      roleList.Admin,
      roleList.ICT_administrator,
      roleList.Principal,
      roleList.Proprietor
    ),
    termController.updateTerm
  )
router
  .route('/:id/delete')
  .delete(
    authenticateToken,
    verifyRoles(
      roleList.Admin,
      roleList.ICT_administrator,
      roleList.Principal,
      roleList.Proprietor
    ),
    termController.deleteTerm
  )
router
  .route('/:school_id/sessions/:session_id/terms')
  .get(
    authenticateToken,
    verifyRoles(
      roleList.Admin,
      roleList.Principal,
      roleList.Proprietor,
      roleList.ICT_administrator
    ),
    termController.getTermsBySessionAndSchool
  )

module.exports = router
