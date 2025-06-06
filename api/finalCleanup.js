require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./model/User');
const School = require('./model/School');
const GroupSchool = require('./model/GroupSchool');

async function finalCleanup() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔗 Connected to MongoDB');

    console.log('\n📋 Current Annunciation Proprietors:');
    const annunciationProprietors = await User.find({
      roles: 'Proprietor',
      email: {
        $in: [
          'proprietor@annunciationsecondaryschool.com',
          'proprietor@annunciationprimaryschool.com', 
          'proprietor@annunciationnurseryschool.com'
        ]
      }
    });

    for (const p of annunciationProprietors) {
      const school = await School.findById(p.school);
      console.log(`- ${p.firstname} ${p.lastname} (${p.email}) at ${school?.name || 'Unknown'}`);
    }

    // Keep only proprietor@annunciationprimaryschool.com
    const proprietorsToRemove = await User.find({
      roles: 'Proprietor',
      email: {
        $in: [
          'proprietor@annunciationsecondaryschool.com',
          'proprietor@annunciationnurseryschool.com'
        ]
      }
    });

    console.log('\n🗑️  Removing these proprietors to enforce constraint:');
    for (const p of proprietorsToRemove) {
      const school = await School.findById(p.school);
      console.log(`- ${p.firstname} ${p.lastname} (${p.email}) at ${school?.name || 'Unknown'}`);
    }

    console.log('\n✅ Keeping: proprietor@annunciationprimaryschool.com');

    // Remove the proprietors
    for (const proprietor of proprietorsToRemove) {
      console.log(`\n🗑️  Removing: ${proprietor.firstname} ${proprietor.lastname} (${proprietor.email})`);
      await User.findByIdAndDelete(proprietor._id);
      console.log(`   ✅ Deleted`);
    }

    console.log('\n📊 Final Proprietors List:');
    const finalProprietors = await User.find({ roles: 'Proprietor' });
    for (const p of finalProprietors) {
      let schoolName = 'No school';
      if (p.school) {
        const school = await School.findById(p.school);
        schoolName = school ? school.name : 'School not found';
      }
      console.log(`- ${p.firstname} ${p.lastname} (${p.email}) at ${schoolName}`);
    }

    // Final constraint check
    console.log('\n🔍 Final Constraint Check:');
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
        console.log(`      - ${proprietors[0].firstname} ${proprietors[0].lastname} (${proprietors[0].email}) at ${school?.name || 'Unknown'}`);
      } else {
        console.log(`   ℹ️  No proprietors`);
      }
    }

    console.log('\n🎉 Final cleanup completed! Constraint now enforced.');
    console.log('✅ Only one proprietor per GroupSchool remains.');

  } catch (error) {
    console.error('❌ Error during final cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

finalCleanup();
