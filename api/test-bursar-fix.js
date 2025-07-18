// Test Bursar endpoints after fix
const axios = require('axios');

(async () => {
  console.log('💰 Testing Bursar Endpoints After Fix...\n');
  
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
    console.log('School:', user.school?.name || 'No school');
    console.log('');
    
    const headers = { Authorization: `Bearer ${token}` };
    
    // Test Schools endpoint
    console.log('📚 Testing Schools endpoint...');
    try {
      const schoolsResponse = await axios.get('http://localhost:3000/api/v1/school/all', { headers });
      console.log('✅ Schools loaded:', schoolsResponse.data.length, 'schools');
      if (schoolsResponse.data.length > 0) {
        console.log('   School name:', schoolsResponse.data[0].name);
        console.log('   School ID:', schoolsResponse.data[0]._id);
      }
    } catch (error) {
      console.log('❌ Schools failed:', error.response?.status, error.response?.data?.message || error.message);
    }
    
    // Test Terms endpoint
    console.log('\n📝 Testing Terms endpoint...');
    try {
      const termsResponse = await axios.get('http://localhost:3000/api/v1/Term/all', { headers });
      console.log('✅ Terms loaded:', termsResponse.data.length, 'terms');
      if (termsResponse.data.length > 0) {
        console.log('   First term:', termsResponse.data[0].name);
        console.log('   Term ID:', termsResponse.data[0]._id);
      }
    } catch (error) {
      console.log('❌ Terms failed:', error.response?.status, error.response?.data?.message || error.message);
    }
    
    // Test Sessions endpoint
    console.log('\n📅 Testing Sessions endpoint...');
    try {
      const sessionsResponse = await axios.get('http://localhost:3000/api/v1/Session/all', { headers });
      console.log('✅ Sessions loaded:', sessionsResponse.data.length, 'sessions');
      if (sessionsResponse.data.length > 0) {
        console.log('   First session:', sessionsResponse.data[0].name);
      }
    } catch (error) {
      console.log('❌ Sessions failed:', error.response?.status, error.response?.data?.message || error.message);
    }
    
    // Test Fee creation (if we have school and term data)
    const schoolsResponse = await axios.get('http://localhost:3000/api/v1/school/all', { headers });
    const termsResponse = await axios.get('http://localhost:3000/api/v1/Term/all', { headers });
    
    if (schoolsResponse.data.length > 0 && termsResponse.data.length > 0) {
      console.log('\n💰 Testing Fee Creation...');
      const feeData = {
        school_id: schoolsResponse.data[0]._id,
        term_id: termsResponse.data[0]._id,
        name: `Test Fee ${Date.now()}`,
        decription: 'Test fee for bursar',
        type: 'Tuition',
        amount: 50000,
        isActive: true,
        isInstallmentAllowed: false,
        no_ofInstallments: 1,
        isApproved: false
      };
      
      try {
        const createFeeResponse = await axios.post(
          'http://localhost:3000/api/v1/fee/create',
          feeData,
          { headers }
        );
        
        console.log('✅ Fee created successfully!');
        console.log('Created fee:', createFeeResponse.data.name);
        console.log('Fee ID:', createFeeResponse.data._id);
        
      } catch (createError) {
        console.log('❌ Fee creation failed:');
        console.log('Status:', createError.response?.status);
        console.log('Message:', createError.response?.data?.message || createError.message);
      }
    } else {
      console.log('\n⚠️ Cannot test fee creation - missing school or term data');
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.response?.data?.message || error.message);
  }
})();
