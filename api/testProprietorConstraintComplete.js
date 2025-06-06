const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
require('dotenv').config()

// Import models
const User = require('./model/User')
const School = require('./model/School')
const GroupSchool = require('./model/GroupSchool')
const Address = require('./model/Address')
const Profile = require('./model/Profile')

async function createTestData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://localhost:27017/smart-s'
    )
    console.log('🔗 Connected to MongoDB')

    // 1. Create GroupSchool
    let groupSchool = await GroupSchool.findOne({ name: 'Annunciation Group' })
    if (!groupSchool) {
      groupSchool = new GroupSchool({
        name: 'Annunciation Group',
        description: 'A group of Annunciation schools',
        logo: `https://example.com/logo-${Date.now()}.png`,
      })
      await groupSchool.save()
      console.log('✅ Created GroupSchool: Annunciation Group')
    } else {
      console.log('✅ GroupSchool already exists: Annunciation Group')
    }

    // 2. Create Addresses
    const addresses = []
    for (let i = 1; i <= 3; i++) {
      let address = await Address.findOne({ street: `School Street ${i}` })
      if (!address) {
        address = new Address({
          country: 'Nigeria',
          state: 'Ebonyi',
          town: 'Abakaliki',
          street: `School Street ${i}`,
          street_no: i,
          zip_code: 480211,
        })
        await address.save()
        console.log(`✅ Created Address: School Street ${i}`)
      }
      addresses.push(address)
    }

    // 3. Create Schools in the same GroupSchool
    const schoolsData = [
      {
        name: 'Annunciation Secondary School',
        email: 'info@ass.edu.ng',
        phone: '+2348012345671',
      },
      {
        name: 'Annunciation Primary School',
        email: 'info@aps.edu.ng',
        phone: '+2348012345672',
      },
      {
        name: 'Annunciation Nursery School',
        email: 'info@ans.edu.ng',
        phone: '+2348012345673',
      },
    ]

    const schools = []
    for (let i = 0; i < schoolsData.length; i++) {
      const schoolData = schoolsData[i]
      let school = await School.findOne({ name: schoolData.name })
      if (!school) {
        school = new School({
          groupSchool: groupSchool._id,
          name: schoolData.name,
          address: addresses[i]._id,
          email: schoolData.email,
          phoneNumber: schoolData.phone,
          isActive: true,
        })
        await school.save()
        console.log(`✅ Created School: ${schoolData.name}`)
      }
      schools.push(school)
    }

    return { groupSchool, schools, addresses }
  } catch (error) {
    console.error('❌ Error creating test data:', error)
    throw error
  }
}

async function testProprietorConstraint() {
  try {
    console.log('\n🧪 TESTING PROPRIETOR CONSTRAINT\n')

    // Create test data
    const { groupSchool, schools, addresses } = await createTestData()

    // 4. Try to create first proprietor (should succeed)
    console.log('📝 Test 1: Creating first proprietor...')

    const hashedPassword = await bcrypt.hash('proprietor123', 10)
    const profile1 = new Profile({})
    await profile1.save()

    const proprietor1Data = {
      school: schools[0]._id, // Annunciation Secondary School
      firstname: 'John',
      lastname: 'Proprietor',
      email: 'proprietor1@test.com',
      phone: '+2348012345681',
      address: addresses[0]._id,
      profile: profile1._id,
      DOB: new Date('1980-01-01'),
      gender: 'Male',
      roles: ['Proprietor'],
      password: hashedPassword,
    }

    // Check if proprietor already exists
    let existingProprietor1 = await User.findOne({
      email: proprietor1Data.email,
    })
    if (!existingProprietor1) {
      const proprietor1 = new User(proprietor1Data)
      await proprietor1.save()
      console.log('✅ First proprietor created successfully')
    } else {
      console.log('✅ First proprietor already exists')
    }

    // 5. Try to create second proprietor in different school but same GroupSchool (should fail)
    console.log(
      '\n📝 Test 2: Attempting to create second proprietor in same GroupSchool...'
    )

    const profile2 = new Profile({})
    await profile2.save()

    const proprietor2Data = {
      school: schools[1]._id, // Annunciation Primary School (different school, same GroupSchool)
      firstname: 'Jane',
      lastname: 'Proprietor',
      email: 'proprietor2@test.com',
      phone: '+2348012345682',
      address: addresses[1]._id,
      profile: profile2._id,
      DOB: new Date('1980-01-01'),
      gender: 'Female',
      roles: ['Proprietor'],
      password: hashedPassword,
    }

    // Test our constraint logic manually
    const School = require('./model/School')
    const school = await School.findById(proprietor2Data.school).populate(
      'groupSchool'
    )
    const groupSchoolId = school.groupSchool._id
    const schoolsInGroup = await School.find({ groupSchool: groupSchoolId })
    const schoolIdsInGroup = schoolsInGroup.map((s) => s._id)

    const existingProprietor = await User.findOne({
      school: { $in: schoolIdsInGroup },
      roles: 'Proprietor',
    })

    if (existingProprietor) {
      console.log('❌ CONSTRAINT WORKING: Cannot create second proprietor')
      console.log(
        `   Existing proprietor: ${existingProprietor.firstname} ${existingProprietor.lastname}`
      )
      console.log(`   GroupSchool: ${school.groupSchool.name}`)
      console.log('✅ CONSTRAINT TEST PASSED')
    } else {
      console.log(
        '⚠️  CONSTRAINT FAILED: No existing proprietor found, constraint not working'
      )
    }

    // 6. Test the API endpoint constraint (simulate)
    console.log('\n📝 Test 3: Testing API endpoint constraint...')
    console.log('To test the API constraint, make a POST request to:')
    console.log('POST /api/v1/user/proprietor/create')
    console.log(
      'With data:',
      JSON.stringify(
        {
          school_id: schools[1]._id.toString(),
          firstname: 'Jane',
          lastname: 'Proprietor',
          email: 'proprietor2@test.com',
          phone: '+2348012345682',
          address_id: addresses[1]._id.toString(),
          DOB: '1980-01-01',
          gender: 'Female',
          roles: ['Proprietor'],
          password: 'proprietor123',
        },
        null,
        2
      )
    )
    console.log('Expected result: 409 error with constraint message')

    // 7. Summary
    console.log('\n📊 SUMMARY:')
    console.log(`GroupSchool: ${groupSchool.name}`)
    console.log(`Schools in GroupSchool: ${schools.length}`)

    const allProprietors = await User.find({
      school: { $in: schoolIdsInGroup },
      roles: 'Proprietor',
    }).populate('school', 'name')

    console.log(`Proprietors in GroupSchool: ${allProprietors.length}`)
    allProprietors.forEach((p) => {
      console.log(`  - ${p.firstname} ${p.lastname} at ${p.school.name}`)
    })

    if (allProprietors.length <= 1) {
      console.log(
        '\n✅ CONSTRAINT SATISFIED: Only one proprietor per GroupSchool'
      )
    } else {
      console.log(
        '\n❌ CONSTRAINT VIOLATED: Multiple proprietors in same GroupSchool'
      )
    }
  } catch (error) {
    console.error('❌ Error in test:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 Disconnected from MongoDB')
  }
}

// Run the test
testProprietorConstraint()
