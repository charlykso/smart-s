const express = require('express')
const expenseController = require('../controller/expense_view')
const authenticateToken = require('../middleware/authenticateToken')
const {
  filterByUserSchool,
  enforceSchoolBoundary,
} = require('../middleware/auth')
const verifyRoles = require('../middleware/verifyRoles')
const roleList = require('../helpers/roleList')

const router = express.Router()

router.get(
  '/',
  authenticateToken,
  filterByUserSchool,
  expenseController.getExpenses
)

router.get(
  '/summary',
  authenticateToken,
  filterByUserSchool,
  expenseController.getExpenseSummary
)

router.get(
  '/export/pdf',
  authenticateToken,
  verifyRoles(roleList.Bursar, roleList.Admin),
  filterByUserSchool,
  expenseController.exportExpensesPdf
)

router.get(
  '/:id',
  authenticateToken,
  filterByUserSchool,
  expenseController.getExpense
)

router.post(
  '/',
  authenticateToken,
  verifyRoles(roleList.Bursar, roleList.Admin),
  enforceSchoolBoundary,
  expenseController.createExpense
)

router.put(
  '/:id',
  authenticateToken,
  verifyRoles(roleList.Bursar, roleList.Admin),
  enforceSchoolBoundary,
  expenseController.updateExpense
)

router.delete(
  '/:id',
  authenticateToken,
  verifyRoles(roleList.Bursar, roleList.Admin),
  enforceSchoolBoundary,
  expenseController.deleteExpense
)

router.post(
  '/:id/approve',
  authenticateToken,
  verifyRoles(roleList.Principal, roleList.Proprietor),
  filterByUserSchool,
  expenseController.approveExpense
)

router.post(
  '/:id/reject',
  authenticateToken,
  verifyRoles(roleList.Principal, roleList.Proprietor),
  filterByUserSchool,
  expenseController.rejectExpense
)

module.exports = router
