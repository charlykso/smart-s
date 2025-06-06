const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./model/User');
const School = require('./model/School');
const GroupSchool = require('./model/GroupSchool');

async function testProprietorConstraint() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-s');
    console.log('Connected to MongoDB');

    // Find a GroupSchool with multiple schools
    const groupSchool = await GroupSchool.findOne();
    if (!groupSchool) {
      console.log('No GroupSchool found. Please create one first.');
      return;
    }

    console.log(`Testing with GroupSchool: ${groupSchool.name}`);

    // Find schools in this GroupSchool
    const schools = await School.find({ groupSchool: groupSchool._id });
    console.log(`Found ${schools.length} schools in this GroupSchool:`);
    schools.forEach(school => {
      console.log(`- ${school.name} (ID: ${school._id})`);
    });

    // Check for existing proprietors
    const schoolIds = schools.map(s => s._id);
    const existingProprietors = await User.find({
      school: { $in: schoolIds },
      roles: 'Proprietor'
    }).populate('school', 'name');

    console.log(`\nExisting Proprietors in this GroupSchool:`);
    if (existingProprietors.length === 0) {
      console.log('- None found');
    } else {
      existingProprietors.forEach(proprietor => {
        console.log(`- ${proprietor.firstname} ${proprietor.lastname} (${proprietor.email}) at ${proprietor.school.name}`);
      });
    }

    // Test the constraint
    if (existingProprietors.length > 1) {
      console.log('\n❌ CONSTRAINT VIOLATION: Multiple proprietors found in the same GroupSchool!');
      console.log('This should not be allowed according to the business rule.');
    } else if (existingProprietors.length === 1) {
      console.log('\n✅ CONSTRAINT SATISFIED: Only one proprietor found in this GroupSchool.');
    } else {
      console.log('\n✅ NO PROPRIETORS: This GroupSchool has no proprietors yet.');
    }

    // Test creating a second proprietor (should fail)
    if (existingProprietors.length === 1 && schools.length > 1) {
      console.log('\n🧪 Testing constraint by attempting to create a second proprietor...');
      
      // Find a different school in the same GroupSchool
      const differentSchool = schools.find(s => s._id.toString() !== existingProprietors[0].school._id.toString());
      
      if (differentSchool) {
        console.log(`Attempting to create proprietor for school: ${differentSchool.name}`);
        
        // This should be tested via the API endpoint, not directly in the database
        console.log('To test this properly, use the API endpoint:');
        console.log(`POST /api/v1/user/proprietor/create`);
        console.log(`with school_id: ${differentSchool._id}`);
        console.log('This should return a 409 error with the constraint message.');
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the test
testProprietorConstraint();
