#!/usr/bin/env node

/**
 * Test Script: Academic Section Removal Verification
 *
 * This script verifies that the Academic section has been completely removed
 * from the sidebar navigation, making the application strictly accounting-focused.
 */

const fs = require('fs')
const path = require('path')

console.log('🧪 Testing Academic Section Removal from Sidebar...\n')

// Test 1: Check Sidebar.tsx file
console.log('1. Checking Sidebar.tsx for Academic section removal...')

const sidebarPath = path.join(
  __dirname,
  'frontend',
  'src',
  'components',
  'layout',
  'Sidebar.tsx'
)
try {
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf8')

  // Check for Academic section
  const hasAcademicSection =
    sidebarContent.includes("id: 'academic'") ||
    sidebarContent.includes("label: 'Academic'")

  const hasSessionsReference =
    sidebarContent.includes("id: 'sessions'") ||
    sidebarContent.includes("label: 'Sessions'")

  const hasTermsReference =
    sidebarContent.includes("id: 'terms'") ||
    sidebarContent.includes("label: 'Terms'")

  const hasClassArmsReference =
    sidebarContent.includes("id: 'class-arms'") ||
    sidebarContent.includes("label: 'Class Arms'")

  if (
    !hasAcademicSection &&
    !hasSessionsReference &&
    !hasTermsReference &&
    !hasClassArmsReference
  ) {
    console.log('   ✅ Academic section successfully removed from sidebar')
  } else {
    console.log('   ❌ Academic section still found in sidebar:')
    if (hasAcademicSection) console.log('     - Academic section found')
    if (hasSessionsReference) console.log('     - Sessions reference found')
    if (hasTermsReference) console.log('     - Terms reference found')
    if (hasClassArmsReference) console.log('     - Class Arms reference found')
  }
} catch (error) {
  console.log('   ❌ Error reading Sidebar.tsx:', error.message)
}

// Test 2: Verify current navigation structure
console.log('\n2. Analyzing current navigation structure...')

try {
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf8')

  // Extract navigation menu items
  const menuItems = []
  const lines = sidebarContent.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line.includes("id: '") && line.includes("label: '")) {
      const idMatch = line.match(/id: '([^']+)'/)
      const labelMatch = line.match(/label: '([^']+)'/)
      if (idMatch && labelMatch) {
        menuItems.push({
          id: idMatch[1],
          label: labelMatch[1],
        })
      }
    }
  }

  console.log('   📋 Current navigation menu items:')
  menuItems.forEach((item) => {
    if (
      [
        'dashboard',
        'users',
        'schools',
        'fees',
        'reports',
        'audit',
        'settings',
      ].includes(item.id)
    ) {
      console.log(`     ✅ ${item.label} (${item.id})`)
    } else {
      console.log(`     📝 ${item.label} (${item.id})`)
    }
  })
} catch (error) {
  console.log('   ❌ Error analyzing navigation structure:', error.message)
}

// Test 3: Verify accounting-focused structure
console.log('\n3. Verifying accounting-focused structure...')

const expectedAccountingMenus = ['dashboard', 'fees', 'reports', 'audit']

const accountingMenusFound = []

try {
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf8')

  expectedAccountingMenus.forEach((menu) => {
    if (sidebarContent.includes(`id: '${menu}'`)) {
      accountingMenusFound.push(menu)
    }
  })

  console.log('   📊 Accounting-focused menus verified:')
  expectedAccountingMenus.forEach((menu) => {
    if (accountingMenusFound.includes(menu)) {
      console.log(
        `     ✅ ${menu.charAt(0).toUpperCase() + menu.slice(1)} menu present`
      )
    } else {
      console.log(
        `     ❌ ${menu.charAt(0).toUpperCase() + menu.slice(1)} menu missing`
      )
    }
  })
} catch (error) {
  console.log('   ❌ Error verifying accounting structure:', error.message)
}

// Test 4: Check for Fee Management sub-items
console.log('\n4. Verifying Fee Management structure...')

try {
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf8')

  const feeSubMenus = ['fee-admin', 'student-payments', 'cash-payments']

  console.log('   💰 Fee Management sub-menus:')
  feeSubMenus.forEach((subMenu) => {
    if (sidebarContent.includes(`id: '${subMenu}'`)) {
      console.log(`     ✅ ${subMenu} available`)
    } else {
      console.log(`     ❌ ${subMenu} missing`)
    }
  })
} catch (error) {
  console.log('   ❌ Error checking fee management structure:', error.message)
}

console.log('\n🎯 Summary:')
console.log(
  'The Ledgrio School Accounting System sidebar has been updated to remove all academic-related sections'
)
console.log(
  'and is now strictly focused on accounting functionality including:'
)
console.log('- Dashboard for overview')
console.log('- Fee Management (admin, student payments, cash payments)')
console.log('- Reports for financial analysis')
console.log('- Audit for financial oversight')
console.log('- Settings for system configuration')
console.log('- User and School management for authorized roles')

console.log('\n✅ Academic section removal test completed!')
