const mongoose = require('mongoose');
const { updateClassArmStudentCount, updateAllClassArmsStudentCount, getClassArmCurrentStudentCount } = require('./helpers/classArmHelpers');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-s', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testStudentCountFunctions() {
  try {
    console.log('🧪 Testing ClassArm Student Count Functions...\n');

    // Test 1: Update all classArms student count
    console.log('1️⃣ Testing updateAllClassArmsStudentCount...');
    const allResult = await updateAllClassArmsStudentCount();
    console.log('Result:', JSON.stringify(allResult, null, 2));
    console.log('✅ Test 1 completed\n');

    // Test 2: Get current student count for a specific classArm (if any exist)
    const ClassArm = require('./model/ClassArm');
    const classArms = await ClassArm.find().limit(1);
    
    if (classArms.length > 0) {
      const testClassArmId = classArms[0]._id;
      console.log(`2️⃣ Testing getClassArmCurrentStudentCount for classArm: ${testClassArmId}...`);
      const countResult = await getClassArmCurrentStudentCount(testClassArmId);
      console.log('Result:', JSON.stringify(countResult, null, 2));
      console.log('✅ Test 2 completed\n');

      // Test 3: Update specific classArm student count
      console.log(`3️⃣ Testing updateClassArmStudentCount for classArm: ${testClassArmId}...`);
      const updateResult = await updateClassArmStudentCount(testClassArmId);
      console.log('Result:', JSON.stringify(updateResult, null, 2));
      console.log('✅ Test 3 completed\n');
    } else {
      console.log('⚠️ No classArms found in database. Skipping tests 2 and 3.\n');
    }

    // Test 4: Show summary of all classArms with their student counts
    console.log('4️⃣ Summary of all ClassArms and their student counts:');
    const allClassArms = await ClassArm.find().populate('school', 'name');
    const User = require('./model/User');
    
    for (const classArm of allClassArms) {
      const actualCount = await User.countDocuments({
        classArm: classArm._id,
        roles: 'Student',
        status: 'active'
      });
      
      console.log(`📚 ${classArm.name} (${classArm.school?.name || 'No School'})`);
      console.log(`   Stored Count: ${classArm.totalNumberOfStudents || 0}`);
      console.log(`   Actual Count: ${actualCount}`);
      console.log(`   Status: ${classArm.totalNumberOfStudents === actualCount ? '✅ Accurate' : '⚠️ Needs Update'}\n`);
    }

    console.log('🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    mongoose.connection.close();
    console.log('📝 Database connection closed.');
  }
}

// Run the tests
testStudentCountFunctions();
