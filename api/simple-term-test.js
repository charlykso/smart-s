// Simple test for term creation
const axios = require('axios');

(async () => {
  console.log('🔧 Testing Term Creation Fix...\n');
  
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
    
    // Get sessions to find one for this school
    console.log('📅 Getting sessions...');
    const sessionsResponse = await axios.get('http://localhost:3000/api/v1/Session/all', { headers });
    console.log('Sessions found:', sessionsResponse.data.length);
    
    if (sessionsResponse.data.length === 0) {
      console.log('❌ No sessions found. Cannot test term creation.');
      return;
    }
    
    const session = sessionsResponse.data[0];
    console.log('Using session:', session.name);
    console.log('Session school:', session.school?.name || 'No school info');
    console.log('');
    
    // Try to create a term
    console.log('📝 Creating term...');
    const termData = {
      session: session._id,
      name: `Test Term ${Date.now()}`,
      startDate: '2024-01-15',
      endDate: '2024-04-15'
    };
    
    console.log('Term data:', termData);
    
    try {
      const createTermResponse = await axios.post(
        'http://localhost:3000/api/v1/Term/create',
        termData,
        { headers }
      );
      
      console.log('✅ Term created successfully!');
      console.log('Created term:', createTermResponse.data.name);
      console.log('Term ID:', createTermResponse.data._id);
      
    } catch (createError) {
      console.log('❌ Term creation failed:');
      console.log('Status:', createError.response?.status);
      console.log('Message:', createError.response?.data?.message || createError.message);
      console.log('Full error data:', createError.response?.data);
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.response?.data?.message || error.message);
  }
})();
