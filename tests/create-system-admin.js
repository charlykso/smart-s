// Load environment variables from API directory
const path = require('path')
require('../api/node_modules/dotenv').config({ path: path.join(__dirname, '../api/.env') })

const bcrypt = require('../api/node_modules/bcryptjs')
const User = require('../api/model/User')
const connectDB = require('../api/db/connection')

/**
 * Creates a system administrator account
 * Email: admin@ledgrio.com
 * Password: KGnd#%$ld
 * Role: Admin (highest level access)
 */

const ADMIN_CREDENTIALS = {
  email: 'admin@ledgrio.com',
  password: 'KGnd#%$ld',
  firstname: 'System',
  lastname: 'Administrator',
  phone: '+1234567890',
}

async function createSystemAdmin() {
  try {
    await connectDB()
    console.log('🔧 Creating System Administrator')
    console.log('='.repeat(50))

    // Check if admin already exists
    console.log('1. Checking if admin already exists...')
    const existingAdmin = await User.findOne({ email: ADMIN_CREDENTIALS.email })

    if (existingAdmin) {
      console.log('⚠️  Admin already exists:')
      console.log('   Name:', existingAdmin.firstname, existingAdmin.lastname)
      console.log('   Email:', existingAdmin.email)
      console.log('   Roles:', existingAdmin.roles.join(', '))
      console.log('   Created:', existingAdmin.createdAt?.toLocaleDateString())

      // Update password if needed
      console.log('\n2. Updating password...')
      const hashedPassword = await bcrypt.hash(ADMIN_CREDENTIALS.password, 12)
      await User.findByIdAndUpdate(existingAdmin._id, {
        password: hashedPassword,
        roles: ['Admin'], // Ensure Admin role
        isActive: true,
      })
      console.log('✅ Admin password updated and role verified')
      return
    }

    // Create new admin
    console.log('2. Creating new system administrator...')

    // Hash password
    const hashedPassword = await bcrypt.hash(ADMIN_CREDENTIALS.password, 12)

    // Create admin user
    const adminUser = new User({
      firstname: ADMIN_CREDENTIALS.firstname,
      lastname: ADMIN_CREDENTIALS.lastname,
      email: ADMIN_CREDENTIALS.email,
      password: hashedPassword,
      phone: ADMIN_CREDENTIALS.phone,
      roles: ['Admin'],
      isActive: true,
      // No school assignment - system admin has global access
      type: 'day', // Required field
      gender: 'Male', // Required field
    })

    await adminUser.save()

    console.log('✅ System administrator created successfully!')
    console.log('\n📋 Admin Details:')
    console.log('   Name:', adminUser.firstname, adminUser.lastname)
    console.log('   Email:', adminUser.email)
    console.log('   Roles:', adminUser.roles.join(', '))
    console.log('   Active:', adminUser.isActive)
    console.log('   Created:', adminUser.createdAt?.toLocaleDateString())

    console.log('\n🔐 Login Credentials:')
    console.log('   Email:', ADMIN_CREDENTIALS.email)
    console.log('   Password:', ADMIN_CREDENTIALS.password)

    console.log('\n🎯 Admin Capabilities:')
    console.log('   ✅ Full system access')
    console.log('   ✅ Create/manage all user types')
    console.log('   ✅ Manage all schools and group schools')
    console.log('   ✅ Access all financial data')
    console.log('   ✅ System configuration')
    console.log('   ✅ Audit logs and reports')
  } catch (error) {
    console.error('❌ Error creating system admin:', error.message)

    if (error.code === 11000) {
      console.log('📧 Email already exists in the system')
    } else if (error.name === 'ValidationError') {
      console.log('📝 Validation error:', error.message)
    } else {
      console.log('🔍 Full error:', error)
    }
  } finally {
    process.exit(0)
  }
}

// Run the script
if (require.main === module) {
  createSystemAdmin()
}

module.exports = { createSystemAdmin }
