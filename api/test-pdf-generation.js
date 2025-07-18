// Test PDF generation directly
const { generateStudentCredentialsPDF } = require('./utils/pdfGenerator');

(async () => {
  console.log('🔧 Testing PDF generation...');
  
  try {
    // Test data
    const students = [
      {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@test.com',
        regNo: 'TEST001',
        password: 'password123'
      },
      {
        firstname: 'Jane',
        lastname: 'Smith',
        email: 'jane.smith@test.com',
        regNo: 'TEST002',
        password: 'password456'
      }
    ];
    
    const schoolInfo = {
      name: 'Test School',
      email: 'info@testschool.edu',
      phoneNumber: '+1234567890'
    };
    
    console.log('📄 Generating PDF...');
    const result = await generateStudentCredentialsPDF(students, schoolInfo);
    
    console.log('✅ PDF generated successfully!');
    console.log('File path:', result.filepath);
    console.log('File size:', require('fs').statSync(result.filepath).size, 'bytes');
    
    // Clean up
    require('fs').unlinkSync(result.filepath);
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ PDF generation failed:', error);
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  }
})();
