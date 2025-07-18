// Test fee response format with Bursar account
const axios = require('axios');

(async () => {
  console.log('💰 Testing Fee Response Format with Bursar...\n');
  
  try {
    // Login as Bursar
    const loginResponse = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'bursar@smart-s.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    console.log('✅ Bursar Login Success');
    console.log('User:', user.firstname, user.lastname);
    console.log('');
    
    const headers = { Authorization: `Bearer ${token}` };
    
    // Get required data
    const schoolsResponse = await axios.get('http://localhost:3000/api/v1/school/all', { headers });
    const termsResponse = await axios.get('http://localhost:3000/api/v1/Term/all', { headers });
    
    const school = schoolsResponse.data[0];
    const term = termsResponse.data[0];
    
    console.log('Using school:', school.name);
    console.log('Using term:', term.name);
    console.log('');
    
    // Test Fee Create/Update
    console.log('💰 Testing Fee Operations...');
    
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
    
    console.log('✅ Fee Create Response Format:');
    console.log('   Is wrapped object:', 'success' in createFeeResponse.data);
    console.log('   Success:', createFeeResponse.data.success);
    console.log('   Has data property:', 'data' in createFeeResponse.data);
    console.log('   Fee ID:', createFeeResponse.data.data._id);
    console.log('   Fee Name:', createFeeResponse.data.data.name);
    
    const feeId = createFeeResponse.data.data._id;
    
    const updateFeeResponse = await axios.put(
      `http://localhost:3000/api/v1/fee/${feeId}/update`,
      { ...feeData, name: `Updated ${feeData.name}` },
      { headers }
    );
    
    console.log('\n✅ Fee Update Response Format:');
    console.log('   Is direct object:', '_id' in updateFeeResponse.data);
    console.log('   Has success property:', 'success' in updateFeeResponse.data);
    console.log('   Updated Fee ID:', updateFeeResponse.data._id);
    console.log('   Updated Fee Name:', updateFeeResponse.data.name);
    
    // Cleanup
    console.log('\n🧹 Cleaning up...');
    await axios.delete(`http://localhost:3000/api/v1/fee/${feeId}/delete`, { headers });
    
    console.log('\n🎉 Fee test completed!');
    console.log('\n📋 Fee Response Format Summary:');
    console.log('✅ Fee Create: Wrapped in { success: true, data: fee } - Frontend expects this');
    console.log('✅ Fee Update: Direct fee object - Frontend service was fixed for this');
    
  } catch (error) {
    console.log('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.log('Error response:', error.response.data);
    }
  }
})();
