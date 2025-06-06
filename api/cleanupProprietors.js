require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./model/User');
const School = require('./model/School');
const GroupSchool = require('./model/GroupSchool');

async function cleanupProprietors() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔗 Connected to MongoDB');

    console.log('\n📋 Current Proprietors:');
    const allProprietors = await User.find({ roles: 'Proprietor' }).populate('school', 'name');
    allProprietors.forEach((p, index) => {
      console.log(`${index + 1}. ${p.firstname} ${p.lastname} (${p.email}) at ${p.school?.name || 'No school'}`);
    });

    // Find proprietors to remove
    const proprietorsToRemove = await User.find({
      roles: 'Proprietor',
      email: {
        $in: [
          'proprietor@holyghostsecondaryschool.com',
          'proprietor@testschoolfixed.com'
        ]
      }
    }).populate('school', 'name');

    console.log('\n🗑️  Proprietors to be removed:');
    proprietorsToRemove.forEach((p, index) => {
      console.log(`${index + 1}. ${p.firstname} ${p.lastname} (${p.email}) at ${p.school?.name || 'No school'}`);
    });

    if (proprietorsToRemove.length === 0) {
      console.log('❌ No proprietors found with the specified emails');
      return;
    }

    // Confirm removal
    console.log('\n⚠️  This will permanently delete these proprietor accounts.');
    console.log('✅ Keeping: proprietor@annunciationprimaryschool.com');
    
    // Remove the proprietors
    for (const proprietor of proprietorsToRemove) {
      console.log(`\n🗑️  Removing: ${proprietor.firstname} ${proprietor.lastname} (${proprietor.email})`);
      
      // Delete the user
      await User.findByIdAndDelete(proprietor._id);
      console.log(`   ✅ User deleted`);
      
      // Note: We're not deleting the Profile or Address as they might be referenced elsewhere
      // In a production system, you might want to clean those up too
    }

    console.log('\n📊 Updated Proprietors List:');
    const remainingProprietors = await User.find({ roles: 'Proprietor' }).populate('school', 'name');
    remainingProprietors.forEach((p, index) => {
      console.log(`${index + 1}. ${p.firstname} ${p.lastname} (${p.email}) at ${p.school?.name || 'No school'}`);
    });

    // Verify constraint compliance
    console.log('\n🔍 Checking GroupSchool constraint compliance:');
    const groupSchools = await GroupSchool.find();
    
    for (const gs of groupSchools) {
      const schools = await School.find({ groupSchool: gs._id });
      const schoolIds = schools.map(s => s._id);
      const proprietors = await User.find({ 
        school: { $in: schoolIds }, 
        roles: 'Proprietor' 
      }).populate('school', 'name');
      
      console.log(`\n📚 GroupSchool: ${gs.name}`);
      console.log(`   Schools: ${schools.length}`);
      console.log(`   Proprietors: ${proprietors.length}`);
      
      if (proprietors.length > 1) {
        console.log(`   ❌ CONSTRAINT VIOLATION: Multiple proprietors found`);
        proprietors.forEach(p => {
          console.log(`      - ${p.firstname} ${p.lastname} at ${p.school.name}`);
        });
      } else if (proprietors.length === 1) {
        console.log(`   ✅ CONSTRAINT SATISFIED: One proprietor`);
        console.log(`      - ${proprietors[0].firstname} ${proprietors[0].lastname} at ${proprietors[0].school.name}`);
      } else {
        console.log(`   ℹ️  No proprietors in this GroupSchool`);
      }
    }

    console.log('\n🎉 Cleanup completed successfully!');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the cleanup
cleanupProprietors();
