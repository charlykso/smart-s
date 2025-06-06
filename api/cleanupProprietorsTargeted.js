require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./model/User');
const School = require('./model/School');
const GroupSchool = require('./model/GroupSchool');

async function cleanupProprietorsTargeted() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔗 Connected to MongoDB');

    // First, let's see all proprietors with their school information
    console.log('\n📋 Current Proprietors with School Info:');
    const allProprietors = await User.find({ roles: 'Proprietor' });
    
    for (let i = 0; i < allProprietors.length; i++) {
      const p = allProprietors[i];
      let schoolName = 'No school';
      if (p.school) {
        const school = await School.findById(p.school);
        schoolName = school ? school.name : 'School not found';
      }
      console.log(`${i + 1}. ${p.firstname} ${p.lastname} (${p.email}) at ${schoolName}`);
    }

    // Find proprietors at Holyghost and Test schools
    const holyghostSchool = await School.findOne({ name: /Holyghost/i });
    const testSchool = await School.findOne({ name: /Test School/i });
    
    console.log('\n🔍 Target Schools:');
    if (holyghostSchool) {
      console.log(`- Holyghost School: ${holyghostSchool.name} (ID: ${holyghostSchool._id})`);
    }
    if (testSchool) {
      console.log(`- Test School: ${testSchool.name} (ID: ${testSchool._id})`);
    }

    // Find proprietors to remove
    const schoolIdsToClean = [];
    if (holyghostSchool) schoolIdsToClean.push(holyghostSchool._id);
    if (testSchool) schoolIdsToClean.push(testSchool._id);

    const proprietorsToRemove = await User.find({
      roles: 'Proprietor',
      school: { $in: schoolIdsToClean }
    });

    console.log('\n🗑️  Proprietors to be removed:');
    for (const p of proprietorsToRemove) {
      const school = await School.findById(p.school);
      console.log(`- ${p.firstname} ${p.lastname} (${p.email}) at ${school?.name || 'Unknown school'}`);
    }

    // Also remove test proprietors that were created during testing
    const testProprietorsToRemove = await User.find({
      roles: 'Proprietor',
      email: {
        $in: [
          'proprietor1@test.com',
          'proprietor2@test.com', 
          'proprietor3@test.com',
          'testproprietor@test.com',
          'anotherproprietor@test.com',
          'debugtest@test.com',
          'finaltest@test.com',
          'constrainttest@test.com',
          'finalconstraint@test.com'
        ]
      }
    });

    console.log('\n🧪 Test Proprietors to be removed:');
    testProprietorsToRemove.forEach(p => {
      console.log(`- ${p.firstname} ${p.lastname} (${p.email})`);
    });

    // Combine all proprietors to remove
    const allToRemove = [...proprietorsToRemove, ...testProprietorsToRemove];
    
    if (allToRemove.length === 0) {
      console.log('\n✅ No proprietors found to remove');
      return;
    }

    console.log(`\n⚠️  Total proprietors to remove: ${allToRemove.length}`);
    console.log('✅ Keeping: proprietor@annunciationprimaryschool.com and other Annunciation school proprietors');
    
    // Remove the proprietors
    for (const proprietor of allToRemove) {
      console.log(`\n🗑️  Removing: ${proprietor.firstname} ${proprietor.lastname} (${proprietor.email})`);
      await User.findByIdAndDelete(proprietor._id);
      console.log(`   ✅ Deleted`);
    }

    console.log('\n📊 Final Proprietors List:');
    const finalProprietors = await User.find({ roles: 'Proprietor' });
    for (let i = 0; i < finalProprietors.length; i++) {
      const p = finalProprietors[i];
      let schoolName = 'No school';
      if (p.school) {
        const school = await School.findById(p.school);
        schoolName = school ? school.name : 'School not found';
      }
      console.log(`${i + 1}. ${p.firstname} ${p.lastname} (${p.email}) at ${schoolName}`);
    }

    // Check constraint compliance
    console.log('\n🔍 Checking GroupSchool constraint compliance:');
    const groupSchools = await GroupSchool.find();
    
    for (const gs of groupSchools) {
      const schools = await School.find({ groupSchool: gs._id });
      const schoolIds = schools.map(s => s._id);
      const proprietors = await User.find({ 
        school: { $in: schoolIds }, 
        roles: 'Proprietor' 
      });
      
      console.log(`\n📚 GroupSchool: ${gs.name}`);
      console.log(`   Schools: ${schools.length}`);
      console.log(`   Proprietors: ${proprietors.length}`);
      
      if (proprietors.length > 1) {
        console.log(`   ❌ CONSTRAINT VIOLATION: Multiple proprietors`);
        for (const p of proprietors) {
          const school = await School.findById(p.school);
          console.log(`      - ${p.firstname} ${p.lastname} at ${school?.name || 'Unknown'}`);
        }
      } else if (proprietors.length === 1) {
        console.log(`   ✅ CONSTRAINT SATISFIED`);
        const school = await School.findById(proprietors[0].school);
        console.log(`      - ${proprietors[0].firstname} ${proprietors[0].lastname} at ${school?.name || 'Unknown'}`);
      } else {
        console.log(`   ℹ️  No proprietors`);
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

cleanupProprietorsTargeted();
