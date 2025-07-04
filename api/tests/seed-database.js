const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
require('dotenv').config()

// Import models
const User = require('../model/User')
const School = require('../model/School')
const GroupSchool = require('../model/GroupSchool')
const Address = require('../model/Address')

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n')

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Connected to MongoDB')

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@smart-s.com' })
    if (existingAdmin) {
      console.log('ℹ️ Admin user already exists')
    } else {
      // Create admin user
      console.log('1. Creating admin user...')
      const hashedPassword = await bcrypt.hash('password123', 10)

      const adminUser = new User({
        firstname: 'System',
        lastname: 'Admin',
        email: 'admin@smart-s.com',
        password: hashedPassword,
        phone: '+1234567890',
        regNo: 'ADMIN001',
        gender: 'Male',
        roles: ['Admin', 'Proprietor'],
        status: 'active',
        isActive: true,
      })

      await adminUser.save()
      console.log('✅ Admin user created: admin@smart-s.com / password123')
    }

    // Check if school exists or get any existing school
    let school = await School.findOne({ name: 'Test High School' })
    if (!school) {
      // Check if any school exists at all
      const existingSchool = await School.findOne({})
      if (existingSchool) {
        school = existingSchool
        console.log(
          `ℹ️ Using existing school: ${school.name} (ID: ${school._id})`
        )
      } else {
        console.log('2. Creating test school...')

        // Create or get Address
        let address = await Address.findOne({
          street: 'Test Street',
          street_no: 123,
        })
        if (!address) {
          address = new Address({
            country: 'United States',
            state: 'Test State',
            town: 'Test Town',
            street: 'Test Street',
            zip_code: 12345,
            street_no: 123,
          })
          await address.save()
        }

        // Create or get GroupSchool
        let groupSchool = await GroupSchool.findOne({
          name: 'Test Education Group',
        })
        if (!groupSchool) {
          groupSchool = new GroupSchool({
            name: 'Test Education Group',
            description: 'Test education group for development',
            logo: 'test-logo-url.png',
          })
          await groupSchool.save()
        }

        // Create School with unique values
        school = new School({
          name: 'Test High School',
          address: address._id,
          email: 'admin@testschool.edu',
          phoneNumber: '+1234567890',
          groupSchool: groupSchool._id,
          isActive: true,
        })
        await school.save()
        console.log(`✅ School created: ${school.name} (ID: ${school._id})`)
      }
    } else {
      console.log(
        `ℹ️ School already exists: ${school.name} (ID: ${school._id})`
      )
    }

    // Check if bursar exists
    const existingBursar = await User.findOne({ email: 'bursar@smart-s.com' })
    if (existingBursar) {
      console.log('ℹ️ Bursar already exists')
    } else {
      console.log('3. Creating bursar...')
      const hashedPassword = await bcrypt.hash('password123', 10)

      const bursar = new User({
        firstname: 'Test',
        lastname: 'Bursar',
        email: 'bursar@smart-s.com',
        password: hashedPassword,
        phone: '+1111111111',
        regNo: 'BUR001',
        gender: 'Male',
        school: school._id,
        roles: ['Bursar'],
        status: 'active',
        isActive: true,
      })

      await bursar.save()
      console.log('✅ Bursar created: bursar@smart-s.com / password123')
      console.log(`   School: ${school.name}`)
    }

    // Check if principal exists
    const existingPrincipal = await User.findOne({
      email: 'principal@smart-s.com',
    })
    if (existingPrincipal) {
      console.log('ℹ️ Principal already exists')
    } else {
      console.log('4. Creating principal...')
      const hashedPassword = await bcrypt.hash('password123', 10)

      const principal = new User({
        firstname: 'Test',
        lastname: 'Principal',
        email: 'principal@smart-s.com',
        password: hashedPassword,
        phone: '+2222222222',
        regNo: 'PRI001',
        gender: 'Female',
        school: school._id,
        roles: ['Principal'],
        status: 'active',
        isActive: true,
      })

      await principal.save()
      console.log('✅ Principal created: principal@smart-s.com / password123')
      console.log(`   School: ${school.name}`)
    }

    console.log('\n🎉 Database seeding completed!')
    console.log('\n📋 Available Test Users:')
    console.log('👑 Admin: admin@smart-s.com / password123')
    console.log('💰 Bursar: bursar@smart-s.com / password123')
    console.log('🏫 Principal: principal@smart-s.com / password123')
    console.log(`\n🏢 Test School: ${school.name} (ID: ${school._id})`)

    console.log('\n✅ You can now run the access control tests!')
  } catch (error) {
    console.error('❌ Seeding failed:', error.message)
    console.error('Stack trace:', error.stack)
  } finally {
    await mongoose.disconnect()
    console.log('\n📤 Disconnected from MongoDB')
  }
}

// Run the seeding
seedDatabase()
