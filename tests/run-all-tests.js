const { testStudentSystem } = require('./test-student')
const { testAdminSystem } = require('./test-admin')
const { testICTAdminSystem } = require('./test-ict-admin')
const { testBursarSystem } = require('./test-bursar')
const { testPrincipalSystem } = require('./test-principal')

/**
 * Master Test Suite
 * Runs comprehensive tests for all user types in the Smart School Academy system
 */

async function runAllTests() {
  console.log('🏫 Smart School Academy - Comprehensive System Test')
  console.log('='.repeat(60))
  console.log(
    'Testing all user types and their respective functionalities...\n'
  )

  const results = {
    student: false,
    admin: false,
    ictAdmin: false,
    bursar: false,
    principal: false,
  }

  // Test Student System
  try {
    await testStudentSystem()
    results.student = true
    console.log('\n✅ Student system tests PASSED\n')
  } catch (error) {
    console.log('\n❌ Student system tests FAILED\n')
  }

  // Test Admin System
  try {
    await testAdminSystem()
    results.admin = true
    console.log('\n✅ Admin system tests PASSED\n')
  } catch (error) {
    console.log('\n❌ Admin system tests FAILED\n')
  }

  // Test ICT Admin System
  try {
    await testICTAdminSystem()
    results.ictAdmin = true
    console.log('\n✅ ICT Admin system tests PASSED\n')
  } catch (error) {
    console.log('\n❌ ICT Admin system tests FAILED\n')
  }

  // Test Bursar System
  try {
    await testBursarSystem()
    results.bursar = true
    console.log('\n✅ Bursar system tests PASSED\n')
  } catch (error) {
    console.log('\n❌ Bursar system tests FAILED\n')
  }

  // Test Principal System
  try {
    await testPrincipalSystem()
    results.principal = true
    console.log('\n✅ Principal system tests PASSED\n')
  } catch (error) {
    console.log('\n❌ Principal system tests FAILED\n')
  }

  // Summary Report
  console.log('📊 FINAL TEST SUMMARY')
  console.log('='.repeat(60))
  console.log(
    `Student System:     ${results.student ? '✅ PASSED' : '❌ FAILED'}`
  )
  console.log(
    `Admin System:       ${results.admin ? '✅ PASSED' : '❌ FAILED'}`
  )
  console.log(
    `ICT Admin System:   ${results.ictAdmin ? '✅ PASSED' : '❌ FAILED'}`
  )
  console.log(
    `Bursar System:      ${results.bursar ? '✅ PASSED' : '❌ FAILED'}`
  )
  console.log(
    `Principal System:   ${results.principal ? '✅ PASSED' : '❌ FAILED'}`
  )

  const passedTests = Object.values(results).filter(Boolean).length
  const totalTests = Object.keys(results).length

  console.log('\n' + '='.repeat(60))
  console.log(`OVERALL RESULT: ${passedTests}/${totalTests} systems passed`)

  if (passedTests === totalTests) {
    console.log('🎉 ALL SYSTEMS OPERATIONAL!')
  } else {
    console.log('⚠️  Some systems need attention.')
  }
}

if (require.main === module) {
  runAllTests().catch(console.error)
}

module.exports = { runAllTests }
