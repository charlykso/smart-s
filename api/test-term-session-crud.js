// Test Term and Session CRUD operations after fixes
const axios = require('axios');

(async () => {
  console.log('🔧 Testing Term and Session CRUD Operations...\n');
  
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
      console.log('❌ No sessions found. Cannot test term operations.');
      return;
    }
    
    const session = sessionsResponse.data[0];
    console.log('Using session:', session.name);
    console.log('Session ID:', session._id);
    console.log('');
    
    // Test 1: Create a new term
    console.log('📝 Test 1: Creating new term...');
    const termData = {
      session: session._id,
      name: `Test Term ${Date.now()}`,
      startDate: '2024-01-15',
      endDate: '2024-04-15'
    };
    
    let createdTerm;
    try {
      const createTermResponse = await axios.post(
        'http://localhost:3000/api/v1/Term/create',
        termData,
        { headers }
      );
      
      createdTerm = createTermResponse.data;
      console.log('✅ Term created successfully!');
      console.log('Created term:', createdTerm.name);
      console.log('Term ID:', createdTerm._id);
      
    } catch (createError) {
      console.log('❌ Term creation failed:');
      console.log('Status:', createError.response?.status);
      console.log('Message:', createError.response?.data?.message || createError.message);
      return;
    }
    
    // Test 2: Update the term
    console.log('\n📝 Test 2: Updating term...');
    const updateData = {
      name: `Updated ${createdTerm.name}`,
      startDate: '2024-02-01',
      endDate: '2024-05-01'
    };
    
    try {
      const updateTermResponse = await axios.put(
        `http://localhost:3000/api/v1/Term/${createdTerm._id}/update`,
        updateData,
        { headers }
      );
      
      console.log('✅ Term updated successfully!');
      console.log('Updated term:', updateTermResponse.data.name);
      console.log('New start date:', updateTermResponse.data.startDate);
      
    } catch (updateError) {
      console.log('❌ Term update failed:');
      console.log('Status:', updateError.response?.status);
      console.log('Message:', updateError.response?.data?.message || updateError.message);
    }
    
    // Test 3: Delete the term
    console.log('\n📝 Test 3: Deleting term...');
    try {
      const deleteTermResponse = await axios.delete(
        `http://localhost:3000/api/v1/Term/${createdTerm._id}/delete`,
        { headers }
      );
      
      console.log('✅ Term deleted successfully!');
      console.log('Message:', deleteTermResponse.data.message);
      
    } catch (deleteError) {
      console.log('❌ Term deletion failed:');
      console.log('Status:', deleteError.response?.status);
      console.log('Message:', deleteError.response?.data?.message || deleteError.message);
    }
    
    // Test 4: Update session
    console.log('\n📅 Test 4: Updating session...');
    const sessionUpdateData = {
      school_id: session.school._id || session.school,
      name: `Updated ${session.name}`,
      startDate: session.startDate,
      endDate: session.endDate
    };
    
    try {
      const updateSessionResponse = await axios.put(
        `http://localhost:3000/api/v1/Session/${session._id}/update`,
        sessionUpdateData,
        { headers }
      );
      
      console.log('✅ Session updated successfully!');
      console.log('Updated session:', updateSessionResponse.data.name);
      
    } catch (updateError) {
      console.log('❌ Session update failed:');
      console.log('Status:', updateError.response?.status);
      console.log('Message:', updateError.response?.data?.message || updateError.message);
    }
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.log('❌ Test failed:', error.response?.data?.message || error.message);
  }
})();
