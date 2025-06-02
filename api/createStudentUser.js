const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./model/User');
require('dotenv').config();

const createStudentUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Check if student user already exists
        const existingStudent = await User.findOne({ email: 'student@smart-s.com' });
        if (existingStudent) {
            console.log('Student user already exists:');
            console.log('Email:', existingStudent.email);
            console.log('Name:', existingStudent.firstname, existingStudent.lastname);
            console.log('Roles:', existingStudent.roles);
            console.log('RegNo:', existingStudent.regNo);
        } else {
            // Hash password
            const hashedPassword = await bcrypt.hash('password123', 10);

            // Create student user
            const studentUser = new User({
                firstname: 'John',
                lastname: 'Student',
                email: 'student@smart-s.com',
                phone: '+1234567891',
                password: hashedPassword,
                roles: ['Student'],
                type: 'day',
                gender: 'Male',
                regNo: 'STU001'
            });

            await studentUser.save();
            console.log('Student user created successfully:');
            console.log('Email: student@smart-s.com');
            console.log('Password: password123');
            console.log('Roles: Student');
            console.log('RegNo: STU001');
        }

        // Test password verification
        const student = await User.findOne({ email: 'student@smart-s.com' });
        if (student) {
            const isPasswordValid = await bcrypt.compare('password123', student.password);
            console.log('Password verification test:', isPasswordValid ? 'PASSED' : 'FAILED');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createStudentUser();
