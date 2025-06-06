require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const User = require('./model/User');
const School = require('./model/School');
const GroupSchool = require('./model/GroupSchool');
const Profile = require('./model/Profile');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

// Helper function
const checkExistingProprietorInGroupSchool = async (schoolId, excludeUserId = null) => {
  console.log('Helper function called with schoolId:', schoolId);
  
  const school = await School.findById(schoolId).populate('groupSchool');
  if (!school) {
    throw new Error('School not found');
  }
  console.log('School found:', school.name);

  const groupSchoolId = school.groupSchool._id;
  const schoolsInGroup = await School.find({ groupSchool: groupSchoolId });
  const schoolIdsInGroup = schoolsInGroup.map((s) => s._id);
  console.log('Schools in group:', schoolsInGroup.length);

  const query = {
    school: { $in: schoolIdsInGroup },
    roles: 'Proprietor',
  };

  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
  }

  const existingProprietor = await User.findOne(query);
  console.log('Existing proprietor found:', existingProprietor ? `${existingProprietor.firstname} ${existingProprietor.lastname}` : 'None');

  return {
    exists: !!existingProprietor,
    proprietor: existingProprietor,
    groupSchool: school.groupSchool,
    school: school,
  };
};

// Test endpoint
app.post('/api/v1/user/proprietor/create', async (req, res) => {
  try {
    console.log('=== CREATE PROPRIETOR REQUEST ===');
    console.log('Request body:', req.body);

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
    } = req.body;

    console.log('1. Validating fields...');
    if (
      !school_id || !firstname || !middlename || !lastname || 
      !email || !phone || !address_id || !DOB || !gender || 
      !roles || !password
    ) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ message: 'All fields are required' });
    }

    console.log('2. Checking existing user...');
    const existingUser = await User.findOne({ email: email, phone: phone });
    if (existingUser) {
      console.log('❌ User already exists');
      return res.status(400).json({ message: 'User already exists' });
    }

    console.log('3. Checking proprietor constraint...');
    const proprietorCheck = await checkExistingProprietorInGroupSchool(school_id);
    
    if (proprietorCheck.exists) {
      console.log('❌ Constraint violation detected');
      return res.status(409).json({
        message: `A Proprietor already exists for this Group School (${proprietorCheck.groupSchool.name}). Only one Proprietor is allowed per Group School.`,
        existingProprietor: {
          name: `${proprietorCheck.proprietor.firstname} ${proprietorCheck.proprietor.lastname}`,
          email: proprietorCheck.proprietor.email,
          school: proprietorCheck.school.name,
        },
      });
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
    res.status(201).json({ message: 'Proprietor created successfully' });

  } catch (error) {
    console.error('❌ Error in createProprietor:', error);
    res.status(500).json({ message: error.message });
  }
});

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Connect to MongoDB and start server
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    app.listen(3000, () => {
      console.log('Test server running on http://localhost:3000');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

startServer();
