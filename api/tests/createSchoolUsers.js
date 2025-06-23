const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('./model/User')
const School = require('./model/School')
const GroupSchool = require('./model/GroupSchool')
require('dotenv').config()

const createSchoolUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB') // Hash password for all users
    const hashedPassword = await bcrypt.hash('password123', 10)

    // First, create a test group school if it doesn't exist
    let testGroupSchool = await GroupSchool.findOne({
      name: 'Smart Education Group',
    })
    if (!testGroupSchool) {
      testGroupSchool = new GroupSchool({
        name: 'Smart Education Group',
        description:
          'A leading educational institution group providing quality education',
        logo: 'https://via.placeholder.com/200x200.png?text=SEG',
      })
      await testGroupSchool.save()
      console.log('Test group school created: Smart Education Group')
    }

    const groupSchoolId = testGroupSchool._id

    // Then, create a test school if it doesn't exist
    let testSchool = await School.findOne({ name: 'Smart School Academy' })
    if (!testSchool) {
      testSchool = new School({
        groupSchool: groupSchoolId,
        name: 'Smart School Academy',
        email: 'info@smartschoolacademy.edu',
        phoneNumber: '+1234567890',
        isActive: true,
      })
      await testSchool.save()
      console.log('Test school created: Smart School Academy')
    }

    const schoolId = testSchool._id

    // Define users to create
    const usersToCreate = [
      {
        firstname: 'John',
        lastname: 'Principal',
        email: 'principal@smartschool.edu',
        phone: '+1234567801',
        password: hashedPassword,
        roles: ['Principal'],
        type: 'day',
        gender: 'Male',
        regNo: 'PRIN001',
        school: schoolId,
      },
      {
        firstname: 'Sarah',
        lastname: 'Johnson',
        email: 'bursar@smartschool.edu',
        phone: '+1234567802',
        password: hashedPassword,
        roles: ['Bursar'],
        type: 'day',
        gender: 'Female',
        regNo: 'BUR001',
        school: schoolId,
      },
      {
        firstname: 'Michael',
        lastname: 'Tech',
        email: 'ictadmin@smartschool.edu',
        phone: '+1234567803',
        password: hashedPassword,
        roles: ['ICT_administrator'],
        type: 'day',
        gender: 'Male',
        regNo: 'ICT001',
        school: schoolId,
      },
      {
        firstname: 'Alice',
        lastname: 'Student',
        email: 'alice.student@smartschool.edu',
        phone: '+1234567804',
        password: hashedPassword,
        roles: ['Student'],
        type: 'day',
        gender: 'Female',
        regNo: 'STU001',
        school: schoolId,
      },
      {
        firstname: 'Bob',
        lastname: 'Wilson',
        email: 'bob.wilson@smartschool.edu',
        phone: '+1234567805',
        password: hashedPassword,
        roles: ['Student'],
        type: 'boarding',
        gender: 'Male',
        regNo: 'STU002',
        school: schoolId,
      },
    ]

    // Create users
    for (const userData of usersToCreate) {
      const existingUser = await User.findOne({ email: userData.email })

      if (!existingUser) {
        const user = new User(userData)
        await user.save()

        console.log(`✅ ${userData.roles[0]} user created successfully:`)
        console.log(`   Name: ${userData.firstname} ${userData.lastname}`)
        console.log(`   Email: ${userData.email}`)
        console.log(`   Password: password123`)
        console.log(`   Role: ${userData.roles[0]}`)
        console.log(`   Registration No: ${userData.regNo}`)
        console.log(`   Type: ${userData.type}`)
        console.log('   ---')
      } else {
        console.log(`⚠️  User with email ${userData.email} already exists`)
      }
    }
    console.log('\n🎉 School user creation process completed!')
    console.log('\n📋 Summary of Created Users:')
    console.log('1. Principal: principal@smartschool.edu')
    console.log('2. Bursar: bursar@smartschool.edu')
    console.log('3. ICT Administrator: ictadmin@smartschool.edu')
    console.log('4. Student (Day): alice.student@smartschool.edu')
    console.log('5. Student (Boarding): bob.wilson@smartschool.edu')
    console.log('\n🔑 Default password for all users: password123')
    console.log('🏫 School: Smart School Academy')
    console.log('🏢 Group School: Smart Education Group')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating school users:', error)
    process.exit(1)
  }
}

createSchoolUsers()
