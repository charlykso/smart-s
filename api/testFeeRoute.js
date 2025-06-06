const express = require('express')
const feeController = require('./controller/Fee_view')
const authenticateToken = require('./middleware/authenticateToken')
const {
  filterByUserSchool,
  enforceSchoolBoundary,
} = require('./middleware/auth')
const roleList = require('./helpers/roleList')
const verifyRoles = require('./middleware/verifyRoles')

console.log('Testing route creation...')

try {
  const router = express.Router()
  console.log('Router created successfully')

  console.log('Testing individual components:')
  console.log('- feeController.getFees:', typeof feeController.getFees)
  console.log('- authenticateToken:', typeof authenticateToken)
  console.log('- filterByUserSchool:', typeof filterByUserSchool)

  console.log('Creating route...')
  router.get('/all', authenticateToken, filterByUserSchool, feeController.getFees)
  console.log('✅ Route created successfully!')

  console.log('Testing other routes...')
  router.get('/:id', feeController.getFee)
  console.log('✅ Second route created successfully!')

  router.post('/create', feeController.createFee)
  console.log('✅ Third route created successfully!')

  console.log('All routes created without errors!')

} catch (error) {
  console.error('❌ Error creating routes:', error.message)
  console.error('Stack:', error.stack)
}
