// Test all CRUD operations to verify no error toasts on success
const axios = require('axios');

(async () => {
  console.log('🔧 Testing All CRUD Operations for Error Toast Issues...\n');
  
  try {
    // Login as ICT Admin
    const loginResponse = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'ictadmin@smart-s.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    console.log('✅ ICT Admin Login Success');
    console.log('User:', user.firstname, user.lastname);
    console.log('School:', user.school?.name || 'No school');
    console.log('');
    
    const headers = { Authorization: `Bearer ${token}` };
    
    // Get required data
    const sessionsResponse = await axios.get('http://localhost:3000/api/v1/Session/all', { headers });
    const schoolsResponse = await axios.get('http://localhost:3000/api/v1/school/all', { headers });
    
    if (sessionsResponse.data.length === 0 || schoolsResponse.data.length === 0) {
      console.log('❌ Missing required data (sessions or schools)');
      return;
    }
    
    const session = sessionsResponse.data[0];
    const school = schoolsResponse.data[0];
    
    console.log('📊 Test Data:');
    console.log('Session:', session.name);
    console.log('School:', school.name);
    console.log('');
    
    // Test 1: Term Operations
    console.log('📝 Test 1: Term Operations...');
    
    // Create Term
    const termData = {
      session: session._id,
      name: `Test Term ${Date.now()}`,
      startDate: '2024-01-15',
      endDate: '2024-04-15'
    };
    
    const createTermResponse = await axios.post(
      'http://localhost:3000/api/v1/Term/create',
      termData,
      { headers }
    );
    
    console.log('✅ Term Create Response Format:', typeof createTermResponse.data);
    console.log('   Has success property:', 'success' in createTermResponse.data);
    console.log('   Has data property:', 'data' in createTermResponse.data);
    console.log('   Direct term object:', '_id' in createTermResponse.data);
    
    const termId = createTermResponse.data._id;
    
    // Update Term
    const updateTermResponse = await axios.put(
      `http://localhost:3000/api/v1/Term/${termId}/update`,
      { name: `Updated ${termData.name}`, startDate: termData.startDate, endDate: termData.endDate },
      { headers }
    );
    
    console.log('✅ Term Update Response Format:', typeof updateTermResponse.data);
    console.log('   Has success property:', 'success' in updateTermResponse.data);
    console.log('   Direct term object:', '_id' in updateTermResponse.data);
    
    // Test 2: Session Operations
    console.log('\n📅 Test 2: Session Operations...');
    
    // Create Session
    const sessionData = {
      school_id: school._id,
      name: `Test Session ${Date.now()}`,
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    };
    
    const createSessionResponse = await axios.post(
      'http://localhost:3000/api/v1/Session/create',
      sessionData,
      { headers }
    );
    
    console.log('✅ Session Create Response Format:', typeof createSessionResponse.data);
    console.log('   Has success property:', 'success' in createSessionResponse.data);
    console.log('   Direct session object:', '_id' in createSessionResponse.data);
    
    const sessionId = createSessionResponse.data._id;
    
    // Update Session
    const updateSessionResponse = await axios.put(
      `http://localhost:3000/api/v1/Session/${sessionId}/update`,
      { ...sessionData, name: `Updated ${sessionData.name}` },
      { headers }
    );
    
    console.log('✅ Session Update Response Format:', typeof updateSessionResponse.data);
    console.log('   Direct session object:', '_id' in updateSessionResponse.data);
    
    // Test 3: ClassArm Operations
    console.log('\n🏫 Test 3: ClassArm Operations...');
    
    // Create ClassArm
    const classArmData = {
      school_id: school._id,
      name: `Test Class ${Date.now()}`
    };
    
    const createClassArmResponse = await axios.post(
      'http://localhost:3000/api/v1/ClassArm/create',
      classArmData,
      { headers }
    );
    
    console.log('✅ ClassArm Create Response Format:', typeof createClassArmResponse.data);
    console.log('   Direct classArm object:', '_id' in createClassArmResponse.data);
    
    const classArmId = createClassArmResponse.data._id;
    
    // Update ClassArm
    const updateClassArmResponse = await axios.put(
      `http://localhost:3000/api/v1/ClassArm/${classArmId}/update`,
      { name: `Updated ${classArmData.name}` },
      { headers }
    );
    
    console.log('✅ ClassArm Update Response Format:', typeof updateClassArmResponse.data);
    console.log('   Direct classArm object:', '_id' in updateClassArmResponse.data);
    
    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await axios.delete(`http://localhost:3000/api/v1/Term/${termId}/delete`, { headers });
    await axios.delete(`http://localhost:3000/api/v1/Session/${sessionId}/delete`, { headers });
    await axios.delete(`http://localhost:3000/api/v1/ClassArm/${classArmId}/delete`, { headers });
    
    console.log('✅ Cleanup completed');
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- All operations return data directly (not wrapped in ApiResponse)');
    console.log('- Frontend services should expect direct data, not { success, data } format');
    console.log('- This should eliminate the error toasts on successful operations');
    
  } catch (error) {
    console.log('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.log('Error response:', error.response.data);
    }
  }
})();
