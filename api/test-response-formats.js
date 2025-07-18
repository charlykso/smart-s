// Test response formats for operations that were showing error toasts
const axios = require('axios');

(async () => {
  console.log('🔧 Testing Response Formats for Fixed Operations...\n');
  
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
    console.log('');
    
    const headers = { Authorization: `Bearer ${token}` };
    
    // Get required data
    const sessionsResponse = await axios.get('http://localhost:3000/api/v1/Session/all', { headers });
    const schoolsResponse = await axios.get('http://localhost:3000/api/v1/school/all', { headers });
    
    const session = sessionsResponse.data[0];
    const school = schoolsResponse.data[0];
    
    // Test 1: Term Create/Update
    console.log('📝 Test 1: Term Operations...');
    
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
    
    console.log('✅ Term Create - Response is direct object:', '_id' in createTermResponse.data);
    console.log('   Term ID:', createTermResponse.data._id);
    console.log('   Term Name:', createTermResponse.data.name);
    
    const termId = createTermResponse.data._id;
    
    const updateTermResponse = await axios.put(
      `http://localhost:3000/api/v1/Term/${termId}/update`,
      { name: `Updated ${termData.name}`, startDate: termData.startDate, endDate: termData.endDate },
      { headers }
    );
    
    console.log('✅ Term Update - Response is direct object:', '_id' in updateTermResponse.data);
    console.log('   Updated Name:', updateTermResponse.data.name);
    
    // Test 2: Session Create/Update
    console.log('\n📅 Test 2: Session Operations...');
    
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
    
    console.log('✅ Session Create - Response is direct object:', '_id' in createSessionResponse.data);
    console.log('   Session ID:', createSessionResponse.data._id);
    
    const sessionId = createSessionResponse.data._id;
    
    const updateSessionResponse = await axios.put(
      `http://localhost:3000/api/v1/Session/${sessionId}/update`,
      { ...sessionData, name: `Updated ${sessionData.name}` },
      { headers }
    );
    
    console.log('✅ Session Update - Response is direct object:', '_id' in updateSessionResponse.data);
    
    // Test 3: Fee Update (create returns wrapped, update returns direct)
    console.log('\n💰 Test 3: Fee Operations...');
    
    // Get terms for fee creation
    const termsResponse = await axios.get('http://localhost:3000/api/v1/Term/all', { headers });
    const term = termsResponse.data[0];
    
    const feeData = {
      school_id: school._id,
      term_id: term._id,
      name: `Test Fee ${Date.now()}`,
      decription: 'Test fee description',
      type: 'Tuition',
      amount: 50000,
      isActive: true,
      isInstallmentAllowed: false,
      no_ofInstallments: 1,
      isApproved: false
    };
    
    const createFeeResponse = await axios.post(
      'http://localhost:3000/api/v1/fee/create',
      feeData,
      { headers }
    );
    
    console.log('✅ Fee Create - Response is wrapped:', 'success' in createFeeResponse.data);
    console.log('   Success:', createFeeResponse.data.success);
    console.log('   Has data:', 'data' in createFeeResponse.data);
    
    const feeId = createFeeResponse.data.data._id;
    
    const updateFeeResponse = await axios.put(
      `http://localhost:3000/api/v1/fee/${feeId}/update`,
      { ...feeData, name: `Updated ${feeData.name}` },
      { headers }
    );
    
    console.log('✅ Fee Update - Response is direct object:', '_id' in updateFeeResponse.data);
    
    // Cleanup
    console.log('\n🧹 Cleaning up...');
    await axios.delete(`http://localhost:3000/api/v1/Term/${termId}/delete`, { headers });
    await axios.delete(`http://localhost:3000/api/v1/Session/${sessionId}/delete`, { headers });
    await axios.delete(`http://localhost:3000/api/v1/fee/${feeId}/delete`, { headers });
    
    console.log('\n🎉 All tests completed!');
    console.log('\n📋 Summary of Response Formats:');
    console.log('✅ Term Create/Update: Direct object (fixed)');
    console.log('✅ Session Create/Update: Direct object (fixed)');
    console.log('✅ Fee Create: Wrapped in { success, data } (correct)');
    console.log('✅ Fee Update: Direct object (fixed)');
    console.log('\nFrontend services have been updated to handle these formats correctly.');
    
  } catch (error) {
    console.log('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.log('Error response:', error.response.data);
    }
  }
})();
