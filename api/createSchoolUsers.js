const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
require('dotenv').config()

// Import models
const User = require('./model/User')
const Profile = require('./model/Profile')
const Address = require('./model/Address')

// School data
const schools = [
  {
    id: '68405b7d80498c76b2126e71',
    name: 'Annunciation Secondary School',
    shortName: 'ASS',
  },
  {
    id: '68405fd33f705d8a6ae77355',
    name: 'Annunciation Primary School',
    shortName: 'APS',
  },
  {
    id: '684062343f705d8a6ae773b6',
    name: 'Holyghost Secondary School',
    shortName: 'HSS',
  },
  {
    id: '684063521c5ba900ed1c9302',
    name: 'Test School Fixed',
    shortName: 'TSF',
  },
  {
    id: '68406529007c8504c1f3f6aa',
    name: 'Annunciation Nursery School',
    shortName: 'ANS',
  },
]

// User templates
const userTemplates = [
  {
    role: 'ICT_administrator',
    namePrefix: 'ICT Admin',
    emailSuffix: 'ict',
  },
  {
    role: 'Proprietor',
    namePrefix: 'Proprietor',
    emailSuffix: 'proprietor',
  },
  {
    role: 'Bursar',
    namePrefix: 'Bursar',
    emailSuffix: 'bursar',
  },
]

// Create address for user
const createAddress = async (street, streetNo) => {
  const address = new Address({
    country: 'Nigeria',
    state: 'Ebonyi',
    town: 'Abakaliki',
    street: street,
    street_no: streetNo,
    zip_code: 480211,
  })

  return await address.save()
}

// Create user
const createUser = async (school, userTemplate, addressId) => {
  try {
    const baseEmail = school.name.toLowerCase().replace(/\s+/g, '')
    const email = `${userTemplate.emailSuffix}@${baseEmail}.com`

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      console.log(`User ${email} already exists, skipping...`)
      return null
    }

    const hashedPassword = await bcrypt.hash(
      `${userTemplate.role.toLowerCase()}123`,
      10
    )
    const profile = new Profile({})
    const profileId = await profile.save()

    const userData = {
      school: school.id,
      firstname: userTemplate.namePrefix,
      middlename: 'School',
      lastname: school.shortName,
      email: email,
      phone: `+234${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      address: addressId,
      profile: profileId,
      DOB: new Date('1980-01-01'),
      gender: 'Male',
      roles: [userTemplate.role],
      password: hashedPassword,
    }

    const user = new User(userData)
    await user.save()

    console.log(`✅ Created ${userTemplate.role} for ${school.name}: ${email}`)
    return user
  } catch (error) {
    console.error(
      `❌ Error creating ${userTemplate.role} for ${school.name}:`,
      error.message
    )
    return null
  }
}

// Main function
const createAllUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI)
    console.log('🔗 Connected to MongoDB')

    console.log('🚀 Starting user creation process...\n')

    let streetCounter = 1

    for (const school of schools) {
      console.log(`\n📚 Creating users for ${school.name}:`)

      for (const userTemplate of userTemplates) {
        // Create address
        const street = `${userTemplate.namePrefix} Street ${streetCounter}`
        const address = await createAddress(street, streetCounter)

        // Create user
        await createUser(school, userTemplate, address._id)

        streetCounter++
      }
    }

    console.log('\n🎉 User creation process completed!')
    console.log('\n📋 Summary:')
    console.log(`- Created users for ${schools.length} schools`)
    console.log(`- Created ${userTemplates.length} roles per school`)
    console.log(
      `- Total users created: ${schools.length * userTemplates.length}`
    )

    console.log('\n🔑 Default passwords:')
    console.log('- ICT_administrator: ictadministrator123')
    console.log('- Proprietor: proprietor123')
    console.log('- Bursar: bursar123')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 Disconnected from MongoDB')
    process.exit(0)
  }
}

// Run the script
createAllUsers()
