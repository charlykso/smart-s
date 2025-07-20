const { testStudentSystem } = require('./test-student')
const { testAdminSystem } = require('./test-admin')
const { testICTAdminSystem } = require('./test-ict-admin')
const { testBursarSystem } = require('./test-bursar')
const { testPrincipalSystem } = require('./test-principal')
const { createSystemAdmin } = require('./create-system-admin')

/**
 * Master Test Suite - Enhanced Version
 * Runs comprehensive tests for all user types in the Ledgrio School Accounting System
 * Tests the complete workflow from System Admin to Student functionality
 */

async function runAllTests() {
  console.log('🏫 LEDGRIO - Comprehensive School Accounting System Test')
  console.log('='.repeat(70))
  console.log('Testing complete workflow from System Admin to Student functionality...\n')

  const results = {
    systemSetup: false,
    admin: false,
    ictAdmin: false,
    bursar: false,
    principal: false,
    student: false,
  }

  // Step 0: System Setup and Admin Creation
  try {
    console.log('🔧 STEP 0: System Setup and Admin Creation')
    console.log('-'.repeat(50))
    await createSystemAdmin()
    results.systemSetup = true
    console.log('✅ System setup completed successfully\n')
  } catch (error) {
    console.log('❌ System setup failed:', error.message)
    console.log('⚠️  Continuing with existing admin account...\n')
  }

  // Step 1: Test System Admin Functionality
  try {
    console.log('👨‍💼 STEP 1: Testing System Admin Functionality')
    console.log('-'.repeat(50))
    await testAdminSystem()
    results.admin = true
    console.log('✅ System Admin tests PASSED\n')
  } catch (error) {
    console.log('❌ System Admin tests FAILED:', error.message)
    console.log('⚠️  This may affect subsequent tests\n')
  }

  // Step 2: Test ICT Admin Functionality
  try {
    console.log('💻 STEP 2: Testing ICT Admin Functionality')
    console.log('-'.repeat(50))
    await testICTAdminSystem()
    results.ictAdmin = true
    console.log('✅ ICT Admin tests PASSED\n')
  } catch (error) {
    console.log('❌ ICT Admin tests FAILED:', error.message)
    console.log('⚠️  School technical management may be affected\n')
  }

  // Step 3: Test Bursar Functionality
  try {
    console.log('💰 STEP 3: Testing School Bursar Functionality')
    console.log('-'.repeat(50))
    await testBursarSystem()
    results.bursar = true
    console.log('✅ Bursar tests PASSED\n')
  } catch (error) {
    console.log('❌ Bursar tests FAILED:', error.message)
    console.log('⚠️  Financial management may be affected\n')
  }

  // Step 4: Test Principal Functionality
  try {
    console.log('🎓 STEP 4: Testing School Principal Functionality')
    console.log('-'.repeat(50))
    await testPrincipalSystem()
    results.principal = true
    console.log('✅ Principal tests PASSED\n')
  } catch (error) {
    console.log('❌ Principal tests FAILED:', error.message)
    console.log('⚠️  Academic oversight may be affected\n')
  }

  // Step 5: Test Student Functionality
  try {
    console.log('🎓 STEP 5: Testing Student Functionality')
    console.log('-'.repeat(50))
    await testStudentSystem()
    results.student = true
    console.log('✅ Student tests PASSED\n')
  } catch (error) {
    console.log('❌ Student tests FAILED:', error.message)
    console.log('⚠️  Student portal functionality affected\n')
  }

  // Comprehensive Summary Report
  console.log('📊 COMPREHENSIVE TEST SUMMARY')
  console.log('='.repeat(70))
  console.log('LEDGRIO School Accounting System - End-to-End Test Results\n')

  console.log('🔧 SYSTEM SETUP & INFRASTRUCTURE:')
  console.log(`   System Setup:       ${results.systemSetup ? '✅ PASSED' : '❌ FAILED'}`)
  console.log(`   System Admin:       ${results.admin ? '✅ PASSED' : '❌ FAILED'}`)

  console.log('\n💼 SCHOOL ADMINISTRATION:')
  console.log(`   ICT Admin:          ${results.ictAdmin ? '✅ PASSED' : '❌ FAILED'}`)
  console.log(`   Principal:          ${results.principal ? '✅ PASSED' : '❌ FAILED'}`)

  console.log('\n💰 FINANCIAL MANAGEMENT:')
  console.log(`   Bursar:             ${results.bursar ? '✅ PASSED' : '❌ FAILED'}`)

  console.log('\n🎓 STUDENT SERVICES:')
  console.log(`   Student Portal:     ${results.student ? '✅ PASSED' : '❌ FAILED'}`)

  const passedTests = Object.values(results).filter(Boolean).length
  const totalTests = Object.keys(results).length

  console.log('\n' + '='.repeat(70))
  console.log(`OVERALL RESULT: ${passedTests}/${totalTests} components passed`)

  if (passedTests === totalTests) {
    console.log('🎉 ALL SYSTEMS FULLY OPERATIONAL!')
    console.log('✅ The school accounting system is ready for production use.')
  } else if (passedTests >= totalTests * 0.8) {
    console.log('⚠️  Most systems operational with minor issues.')
    console.log('🔧 Review failed components and address issues.')
  } else {
    console.log('❌ Critical system issues detected.')
    console.log('🚨 Immediate attention required before production use.')
  }

  console.log('\n📋 NEXT STEPS:')
  if (results.systemSetup && results.admin) {
    console.log('✅ Core system is functional')
  } else {
    console.log('❌ Fix core system issues first')
  }

  if (results.ictAdmin && results.principal) {
    console.log('✅ School administration is operational')
  } else {
    console.log('⚠️  Review school administration setup')
  }

  if (results.bursar) {
    console.log('✅ Financial management is ready')
  } else {
    console.log('❌ Critical: Fix financial management issues')
  }

  if (results.student) {
    console.log('✅ Student services are available')
  } else {
    console.log('⚠️  Student portal needs attention')
  }

  console.log('\n🏫 LEDGRIO System Test Complete')
  console.log('='.repeat(70))
}

if (require.main === module) {
  runAllTests().catch(console.error)
}

module.exports = { runAllTests }
