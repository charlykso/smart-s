require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./model/User');
const School = require('./model/School');
const GroupSchool = require('./model/GroupSchool');
const Profile = require('./model/Profile');
const bcrypt = require('bcryptjs');

// Copy the helper function from user_view.js
const checkExistingProprietorInGroupSchool = async (schoolId, excludeUserId = null) => {
  // Get the school and its GroupSchool
  const school = await School.findById(schoolId).populate('groupSchool');
  if (!school) {
    throw new Error('School not found');
  }

  // Find all schools in the same GroupSchool
  const groupSchoolId = school.groupSchool._id;
  const schoolsInGroup = await School.find({ groupSchool: groupSchoolId });
  const schoolIdsInGroup = schoolsInGroup.map((s) => s._id);

  // Check for existing proprietor
  const query = {
    school: { $in: schoolIdsInGroup },
    roles: 'Proprietor',
  };

  // Exclude current user if updating
  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
  }

  const existingProprietor = await User.findOne(query);

  return {
    exists: !!existingProprietor,
    proprietor: existingProprietor,
    groupSchool: school.groupSchool,
    school: school,
  };
};

// Copy the createProprietor function logic
const testCreateProprietor = async (requestData) => {
  try {
    const {
      school_id,
      firstname,
      middlename,
      lastname,
      email,
      phone,
      address_id,
      DOB,
      gender,
      roles,
      password,
    } = requestData;

    console.log('1. Validating required fields...');
    if (
      school_id === '' ||
      firstname === '' ||
      middlename === '' ||
      lastname === '' ||
      email === '' ||
      phone === '' ||
      address_id === '' ||
      DOB === '' ||
      gender === '' ||
      roles === '' ||
      password === ''
    ) {
      throw new Error('All fields are required');
    }

    console.log('2. Checking if user already exists...');
    const existingUser = await User.findOne({ email: email, phone: phone });
    if (existingUser) {
      throw new Error('User already exists');
    }

    console.log('3. Checking proprietor constraint...');
    const proprietorCheck = await checkExistingProprietorInGroupSchool(school_id);
    if (proprietorCheck.exists) {
      const errorMessage = `A Proprietor already exists for this Group School (${proprietorCheck.groupSchool.name}). Only one Proprietor is allowed per Group School.`;
      const errorDetails = {
        name: `${proprietorCheck.proprietor.firstname} ${proprietorCheck.proprietor.lastname}`,
        email: proprietorCheck.proprietor.email,
        school: proprietorCheck.school.name,
      };
      console.log('❌ CONSTRAINT VIOLATION:', errorMessage);
      console.log('   Existing proprietor:', errorDetails);
      return { success: false, message: errorMessage, existingProprietor: errorDetails };
    }

    console.log('4. Creating proprietor...');
    const hashedPassword = await bcrypt.hash(password, 10);
    const profile = new Profile({});
    const profile_id = await profile.save();
    const proprietor = new User({
      school: school_id,
      firstname,
      middlename,
      lastname,
      email,
      phone,
      address: address_id,
      profile: profile_id,
      DOB,
      gender,
      roles: ['Proprietor'],
      password: hashedPassword,
    });
    await proprietor.save();
    
    console.log('✅ Proprietor created successfully');
    return { success: true, message: 'Proprietor created successfully' };

  } catch (error) {
    console.error('❌ Error in createProprietor:', error.message);
    return { success: false, message: error.message };
  }
};

async function runTest() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const testData = {
      school_id: "68405b7d80498c76b2126e71", // Annunciation Secondary School
      firstname: "Debug",
      middlename: "Test",
      lastname: "Proprietor",
      email: "debugtest@test.com",
      phone: "+2348012345666",
      address_id: "68417a928bed97aa6f8524f6",
      DOB: "1980-01-01",
      gender: "Male",
      roles: ["Proprietor"],
      password: "proprietor123"
    };

    console.log('Testing createProprietor with data:', testData);
    const result = await testCreateProprietor(testData);
    console.log('Result:', result);

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

runTest();
