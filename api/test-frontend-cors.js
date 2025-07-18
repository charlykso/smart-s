// Test CORS and frontend proxy behavior
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

(async () => {
  console.log('🔧 Testing Frontend CORS and Proxy...\n');
  
  try {
    // Test 1: Direct backend request (this should work)
    console.log('📤 Test 1: Direct backend request...');
    const loginResponse = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'ict@greenwood.edu',
      password: 'password123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Direct backend login: SUCCESS');
    
    // Test 2: Frontend proxy request (this might have issues)
    console.log('\n📤 Test 2: Frontend proxy request...');
    try {
      const proxyLoginResponse = await axios.post('http://localhost:3002/api/v1/auth/login', {
        email: 'ict@greenwood.edu',
        password: 'password123'
      });
      console.log('✅ Frontend proxy login: SUCCESS');
    } catch (proxyError) {
      console.log('❌ Frontend proxy login: FAILED');
      console.log('Error:', proxyError.message);
      if (proxyError.response) {
        console.log('Status:', proxyError.response.status);
        console.log('Headers:', proxyError.response.headers);
      }
    }
    
    // Test 3: Check if frontend can handle PDF responses
    console.log('\n📤 Test 3: Frontend PDF handling...');
    
    // Create a test Excel file
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Students');
    
    // Add some empty rows first
    for (let i = 1; i <= 13; i++) {
      worksheet.addRow([]);
    }
    
    // Add header row at row 14
    worksheet.addRow(['firstname', 'middlename', 'lastname', 'email', 'phone', 'regNo', 'gender', 'DOB', 'classArm', 'type']);
    
    // Add unique test data
    const timestamp = Date.now();
    worksheet.addRow(['Test', 'User', 'One', `test.${timestamp}@example.com`, '1234567890', `TEST${timestamp}`, 'Male', '2000-01-01', 'SSS3A', 'day']);
    
    const testFilePath = './test-cors-upload.xlsx';
    await workbook.xlsx.writeFile(testFilePath);
    
    // Try upload through frontend proxy
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(testFilePath));
      formData.append('school_id', '68710d460f09d66cf283b298');
      
      const proxyUploadResponse = await axios.post(
        'http://localhost:3002/api/v1/bulk-students/upload',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            ...formData.getHeaders()
          },
          responseType: 'arraybuffer',
          validateStatus: function (status) {
            return status < 500;
          }
        }
      );
      
      console.log('Frontend proxy upload status:', proxyUploadResponse.status);
      console.log('Frontend proxy upload content-type:', proxyUploadResponse.headers['content-type']);
      
      if (proxyUploadResponse.status === 200 && proxyUploadResponse.headers['content-type']?.includes('application/pdf')) {
        console.log('✅ Frontend proxy PDF upload: SUCCESS');
        fs.writeFileSync('./test-cors-result.pdf', proxyUploadResponse.data);
        console.log('✅ PDF saved via frontend proxy');
      } else {
        console.log('❌ Frontend proxy PDF upload: FAILED');
        console.log('Response data:', proxyUploadResponse.data.toString().substring(0, 500));
      }
      
    } catch (proxyUploadError) {
      console.log('❌ Frontend proxy upload: ERROR');
      console.log('Error:', proxyUploadError.message);
      if (proxyUploadError.response) {
        console.log('Status:', proxyUploadError.response.status);
        console.log('Headers:', proxyUploadError.response.headers);
        console.log('Data:', proxyUploadError.response.data?.toString().substring(0, 500));
      }
    }
    
    // Cleanup
    fs.unlinkSync(testFilePath);
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
})();
