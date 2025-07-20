// Load environment variables from API directory
const path = require('path')
require('../api/node_modules/dotenv').config({ path: path.join(__dirname, '../api/.env') })

const bcrypt = require('../api/node_modules/bcryptjs')
const User = require('../api/model/User')
const School = require('../api/model/School')
const GroupSchool = require('../api/model/GroupSchool')
const connectDB = require('../api/db/connection')

/**
 * Comprehensive Test Environment Setup
 * Creates all necessary test users and data for the Ledgrio School Accounting System
 */

const TEST_USERS = [
  {
    email: 'admin@ledgrio.com',
    password: 'KGnd#%$ld',
    firstname: 'System',
    lastname: 'Administrator',
    phone: '+1234567890',
    roles: ['Admin'],
    type: 'day',
    gender: 'Male',
    description: 'System Administrator with full access'
  },
  {
    email: 'admin@smart-s.com',
    password: 'password123',
    firstname: 'School',
    lastname: 'Admin',
    phone: '+1234567891',
    roles: ['Admin'],
    type: 'day',
    gender: 'Female',
    description: 'School-level Administrator'
  },
  {
    email: 'ictadmin@smart-s.com',
    password: 'password123',
    firstname: 'ICT',
    lastname: 'Administrator',
    phone: '+1234567892',
    roles: ['ICT_administrator'],
    type: 'day',
    gender: 'Male',
    description: 'ICT Administrator for technical management'
  },
  {
    email: 'principal@smart-s.com',
    password: 'password123',
    firstname: 'School',
    lastname: 'Principal',
    phone: '+1234567893',
    roles: ['Principal'],
    type: 'day',
    gender: 'Female',
    description: 'School Principal for academic oversight'
  },
  {
    email: 'bursar@smart-s.com',
    password: 'password123',
    firstname: 'School',
    lastname: 'Bursar',
    phone: '+1234567894',
    roles: ['Bursar'],
    type: 'day',
    gender: 'Male',
    description: 'School Bursar for financial management'
  },
  {
    email: 'student@smart-s.com',
    password: 'password123',
    firstname: 'Test',
    lastname: 'Student',
    phone: '+1234567895',
    roles: ['Student'],
    type: 'day',
    gender: 'Female',
    registrationNumber: 'STU001',
    description: 'Test student account'
  }
]

const TEST_SCHOOL_GROUP = {
  name: 'Smart School Academy Group',
  description: 'Test school group for comprehensive testing',
  logo: 'https://via.placeholder.com/200x200.png?text=Smart+School+Group',
  email: 'group@smart-s.com',
  phone: '+1234567800'
}

const TEST_SCHOOL = {
  name: 'Smart School Academy',
  description: 'Test school for comprehensive functionality testing',
  email: 'school@smart-s.com',
  phoneNumber: '+1234567801',
  isActive: true
}

async function setupTestEnvironment() {
  try {
    await connectDB()
    console.log('🔧 Setting Up Comprehensive Test Environment')
    console.log('='.repeat(60))

    // Step 1: Create Group School
    console.log('1. Setting up Group School...')
    let groupSchool = await GroupSchool.findOne({
      $or: [
        { name: TEST_SCHOOL_GROUP.name },
        { email: TEST_SCHOOL_GROUP.email }
      ]
    })

    if (!groupSchool) {
      groupSchool = new GroupSchool(TEST_SCHOOL_GROUP)
      await groupSchool.save()
      console.log('✅ Group School created:', groupSchool.name)
    } else {
      // Update existing group school
      await GroupSchool.findByIdAndUpdate(groupSchool._id, TEST_SCHOOL_GROUP)
      console.log('ℹ️  Group School updated:', groupSchool.name)
    }

    // Step 2: Create School
    console.log('\n2. Setting up School...')
    let school = await School.findOne({
      $or: [
        { email: TEST_SCHOOL.email },
        { name: TEST_SCHOOL.name }
      ]
    })

    if (!school) {
      school = new School({
        ...TEST_SCHOOL,
        groupSchool: groupSchool._id
      })
      await school.save()
      console.log('✅ School created:', school.name)
    } else {
      // Update existing school
      await School.findByIdAndUpdate(school._id, {
        ...TEST_SCHOOL,
        groupSchool: groupSchool._id
      })
      console.log('ℹ️  School updated:', school.name)
    }

    // Step 3: Create Test Users
    console.log('\n3. Setting up Test Users...')
    const createdUsers = []
    
    for (const userData of TEST_USERS) {
      let user = await User.findOne({ email: userData.email })
      
      if (!user) {
        const hashedPassword = await bcrypt.hash(userData.password, 12)
        
        user = new User({
          ...userData,
          password: hashedPassword,
          isActive: true,
          school: userData.roles.includes('Admin') ? undefined : school._id
        })
        
        await user.save()
        console.log(`✅ Created ${userData.roles[0]}: ${userData.firstname} ${userData.lastname}`)
        createdUsers.push(user)
      } else {
        // Update password and ensure active
        const hashedPassword = await bcrypt.hash(userData.password, 12)
        await User.findByIdAndUpdate(user._id, {
          password: hashedPassword,
          isActive: true,
          roles: userData.roles
        })
        console.log(`ℹ️  Updated ${userData.roles[0]}: ${userData.firstname} ${userData.lastname}`)
      }
    }

    // Step 4: Summary
    console.log('\n📋 Test Environment Setup Complete!')
    console.log('='.repeat(60))
    console.log('✅ Group School:', groupSchool.name)
    console.log('✅ School:', school.name)
    console.log('✅ Test Users Created/Updated:', TEST_USERS.length)
    
    console.log('\n🔐 Test User Credentials:')
    TEST_USERS.forEach(user => {
      console.log(`   ${user.roles[0]}: ${user.email} / ${user.password}`)
    })

    console.log('\n🎯 Ready for Comprehensive Testing!')
    console.log('   Run: node tests/run-all-tests.js')
    
    return {
      groupSchool,
      school,
      users: TEST_USERS.length
    }

  } catch (error) {
    console.error('❌ Error setting up test environment:', error.message)
    
    if (error.code === 11000) {
      console.log('📧 Duplicate key error - some data already exists')
    } else if (error.name === 'ValidationError') {
      console.log('📝 Validation error:', error.message)
    } else {
      console.log('🔍 Full error:', error)
    }
    throw error
  } finally {
    process.exit(0)
  }
}

// Run the script
if (require.main === module) {
  setupTestEnvironment()
}

module.exports = { setupTestEnvironment }
