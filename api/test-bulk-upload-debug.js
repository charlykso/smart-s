// Test bulk upload endpoint to debug the internal server error
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('🔧 Testing Bulk Upload Endpoint...\n');
  
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
    console.log('School ID:', user.school?._id || 'No school ID');
    console.log('');
    
    const headers = { Authorization: `Bearer ${token}` };
    
    // Test 1: Check if bulk upload route exists
    console.log('📝 Test 1: Testing bulk upload route availability...');
    try {
      const testResponse = await axios.post(
        'http://localhost:3000/api/v1/bulk-students/upload',
        {},
        { headers }
      );
      console.log('✅ Route exists, got response:', testResponse.status);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Route exists - got expected 400 error for missing file');
        console.log('Error message:', error.response.data.message);
      } else {
        console.log('❌ Route error:', error.response?.status, error.response?.data?.message);
      }
    }
    
    // Test 2: Download template first
    console.log('\n📝 Test 2: Testing template download...');
    try {
      const templateResponse = await axios.get(
        'http://localhost:3000/api/v1/bulk-students/template',
        { 
          headers,
          responseType: 'arraybuffer'
        }
      );
      console.log('✅ Template download successful');
      console.log('Content-Type:', templateResponse.headers['content-type']);
      console.log('Content-Length:', templateResponse.headers['content-length']);
      
      // Save template for testing
      const templatePath = path.join(__dirname, 'test-template.xlsx');
      fs.writeFileSync(templatePath, templateResponse.data);
      console.log('Template saved to:', templatePath);
      
    } catch (error) {
      console.log('❌ Template download failed:', error.response?.data?.message || error.message);
      return;
    }
    
    // Test 3: Create a simple test Excel file
    console.log('\n📝 Test 3: Creating test Excel file...');
    const XLSX = require('xlsx');
    
    const testData = [
      {
        firstname: 'Test',
        lastname: 'Student',
        middlename: '',
        regNo: `TEST${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        phone: '08012345678',
        DOB: '2010-01-01',
        gender: 'Male',
        classArm: 'JSS 1A',
        type: 'day'
      }
    ];
    
    const worksheet = XLSX.utils.json_to_sheet(testData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    
    const testFilePath = path.join(__dirname, 'test-students.xlsx');
    XLSX.writeFile(workbook, testFilePath);
    console.log('✅ Test Excel file created:', testFilePath);
    
    // Test 4: Upload the test file
    console.log('\n📝 Test 4: Testing bulk upload with test file...');
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFilePath));
    formData.append('school_id', user.school._id);
    
    try {
      const uploadResponse = await axios.post(
        'http://localhost:3000/api/v1/bulk-students/upload',
        formData,
        {
          headers: {
            ...headers,
            ...formData.getHeaders()
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );
      
      console.log('✅ Upload successful!');
      console.log('Response status:', uploadResponse.status);
      console.log('Response data:', uploadResponse.data);
      
    } catch (error) {
      console.log('❌ Upload failed:');
      console.log('Status:', error.response?.status);
      console.log('Message:', error.response?.data?.message);
      console.log('Error details:', error.response?.data?.error);
      console.log('Full error response:', error.response?.data);
      
      // If it's a validation error, show the details
      if (error.response?.data?.errors) {
        console.log('Validation errors:', error.response.data.errors);
      }
      if (error.response?.data?.conflicts) {
        console.log('Conflicts:', error.response.data.conflicts);
      }
    }
    
    // Cleanup
    console.log('\n🧹 Cleaning up test files...');
    try {
      if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);
      if (fs.existsSync(path.join(__dirname, 'test-template.xlsx'))) {
        fs.unlinkSync(path.join(__dirname, 'test-template.xlsx'));
      }
      console.log('✅ Cleanup completed');
    } catch (cleanupError) {
      console.log('⚠️ Cleanup warning:', cleanupError.message);
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.log('Full error response:', error.response.data);
    }
  }
})();
