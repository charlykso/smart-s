const express = require('express')
const router = express.Router()
const termController = require('../controller/Term_view')
const authenticateToken = require('../middleware/authenticateToken')
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
      roleList.Bursar
    ),
    termController.getAllTerms
  )
router
  .route('/:id')
  .get(
    authenticateToken,
    verifyRoles(roleList.Admin, roleList.Principal, roleList.Proprietor),
    termController.getTermById
  )
router
  .route('/create')
  .post(
    authenticateToken,
    verifyRoles(roleList.Admin, roleList.Principal, roleList.Proprietor),
    termController.createTerm
  )
router
  .route('/:id/update')
  .put(
    authenticateToken,
    verifyRoles(roleList.Admin, roleList.Principal, roleList.Proprietor),
    termController.updateTerm
  )
router
  .route('/:id/delete')
  .delete(
    authenticateToken,
    verifyRoles(roleList.Admin, roleList.Principal, roleList.Proprietor),
    termController.deleteTerm
  )
router
  .route('/:school_id/sessions/:session_id/terms')
  .get(
    authenticateToken,
    verifyRoles(roleList.Admin, roleList.Principal, roleList.Proprietor),
    termController.getTermsBySessionAndSchool
  )

module.exports = router
