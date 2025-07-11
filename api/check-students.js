const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('./model/User')
require('dotenv').config()

async function checkStudents() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected successfully')

    const students = await User.find({ roles: 'Student' })
    console.log(`Found ${students.length} students:\n`)

    for (let i = 0; i < students.length; i++) {
      const student = students[i]
      console.log(`${i + 1}. Email: ${student.email}`)
      console.log(`   Name: ${student.firstname} ${student.lastname}`)
      console.log(`   RegNo: ${student.regNo}`)

      // Check if password is 'password123'
      const isPasswordMatch = await bcrypt.compare(
        'password123',
        student.password
      )
      console.log(
        `   Password: password123 - ${
          isPasswordMatch ? '✅ CORRECT' : '❌ INCORRECT'
        }`
      )
      console.log('')
    }

    await mongoose.disconnect()
    console.log('Disconnected from database')
  } catch (error) {
    console.error('Error:', error.message)
  }
}

checkStudents()
