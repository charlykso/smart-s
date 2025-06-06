const express = require('express')

console.log('=== Debugging feeRoute imports ===')

try {
  console.log('1. Testing feeController import...')
  const feeController = require('./controller/Fee_view')
  console.log('✅ feeController imported successfully')
  console.log('   - getFees type:', typeof feeController.getFees)
  console.log('   - Available methods:', Object.keys(feeController))
} catch (error) {
  console.error('❌ feeController import failed:', error.message)
}

try {
  console.log('\n2. Testing authenticateToken import...')
  const authenticateToken = require('./middleware/authenticateToken')
  console.log('✅ authenticateToken imported successfully')
  console.log('   - Type:', typeof authenticateToken)
} catch (error) {
  console.error('❌ authenticateToken import failed:', error.message)
}

try {
  console.log('\n3. Testing auth middleware imports...')
  const authMiddleware = require('./middleware/auth')
  console.log('✅ auth middleware imported successfully')
  console.log('   - Available exports:', Object.keys(authMiddleware))
  console.log(
    '   - filterByUserSchool type:',
    typeof authMiddleware.filterByUserSchool
  )
  console.log(
    '   - enforceSchoolBoundary type:',
    typeof authMiddleware.enforceSchoolBoundary
  )

  const { filterByUserSchool, enforceSchoolBoundary } = authMiddleware
  console.log(
    '   - Destructured filterByUserSchool type:',
    typeof filterByUserSchool
  )
  console.log(
    '   - Destructured enforceSchoolBoundary type:',
    typeof enforceSchoolBoundary
  )
} catch (error) {
  console.error('❌ auth middleware import failed:', error.message)
}

try {
  console.log('\n4. Testing roleList import...')
  const roleList = require('./helpers/roleList')
  console.log('✅ roleList imported successfully')
  console.log('   - Type:', typeof roleList)
  console.log('   - Available roles:', Object.keys(roleList))
} catch (error) {
  console.error('❌ roleList import failed:', error.message)
}

try {
  console.log('\n5. Testing verifyRoles import...')
  const verifyRoles = require('./middleware/verifyRoles')
  console.log('✅ verifyRoles imported successfully')
  console.log('   - Type:', typeof verifyRoles)
} catch (error) {
  console.error('❌ verifyRoles import failed:', error.message)
}

console.log('\n=== Testing route creation ===')

try {
  const feeController = require('./controller/Fee_view')
  const {
    authenticateToken,
    filterByUserSchool,
    enforceSchoolBoundary,
  } = require('./middleware/auth')
  const roleList = require('./helpers/roleList')
  const verifyRoles = require('./middleware/verifyRoles')

  console.log('All imports successful, testing route creation...')

  const router = express.Router()

  console.log('Testing individual middleware functions:')
  console.log('- authenticateToken:', typeof authenticateToken)
  console.log('- filterByUserSchool:', typeof filterByUserSchool)
  console.log('- feeController.getFees:', typeof feeController.getFees)

  if (typeof authenticateToken !== 'function') {
    console.error('❌ authenticateToken is not a function!')
  }
  if (typeof filterByUserSchool !== 'function') {
    console.error('❌ filterByUserSchool is not a function!')
  }
  if (typeof feeController.getFees !== 'function') {
    console.error('❌ feeController.getFees is not a function!')
  }

  console.log('Creating route...')
  router.get(
    '/all',
    authenticateToken,
    filterByUserSchool,
    feeController.getFees
  )
  console.log('✅ Route created successfully!')
} catch (error) {
  console.error('❌ Route creation failed:', error.message)
  console.error('Stack:', error.stack)
}
