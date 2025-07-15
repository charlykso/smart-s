// Create a test Excel template for manual testing
const ExcelJS = require('exceljs');

(async () => {
  console.log('📝 Creating test Excel template...');
  
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Students');
  
  // Add some empty rows first (to simulate real Excel files)
  for (let i = 1; i <= 13; i++) {
    worksheet.addRow([]);
  }
  
  // Add header row at row 14 (same as detected in logs)
  const headerRow = worksheet.addRow(['firstname', 'middlename', 'lastname', 'email', 'phone', 'regNo', 'gender', 'DOB', 'classArm', 'type']);
  
  // Style the header row
  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
  });
  
  // Add sample data with unique identifiers
  const timestamp = Date.now();
  worksheet.addRow(['Alice', 'Marie', 'Johnson', `alice.${timestamp}@greenwood.edu`, '+1234567890', `STU${timestamp}1`, 'Female', '2005-03-15', 'SSS3A', 'day']);
  worksheet.addRow(['Bob', 'James', 'Wilson', `bob.${timestamp}@greenwood.edu`, '+1234567891', `STU${timestamp}2`, 'Male', '2005-04-20', 'SSS1B', 'boarding']);
  worksheet.addRow(['Carol', 'Ann', 'Davis', `carol.${timestamp}@greenwood.edu`, '+1234567892', `STU${timestamp}3`, 'Female', '2005-05-10', 'SSS3A', 'day']);
  
  // Auto-fit columns
  worksheet.columns.forEach(column => {
    column.width = 15;
  });
  
  const filename = `student_template_${timestamp}.xlsx`;
  await workbook.xlsx.writeFile(filename);
  
  console.log(`✅ Test template created: ${filename}`);
  console.log('');
  console.log('📋 Template contains:');
  console.log('- Header row at row 14 (as expected by the parser)');
  console.log('- 3 sample students with unique emails and regNos');
  console.log('- Correct data types: type = "day" or "boarding"');
  console.log('- Valid class arms: SSS3A, SSS1B (exist in Greenwood School)');
  console.log('');
  console.log('🎯 To test:');
  console.log('1. Download this file');
  console.log('2. Go to http://localhost:3002');
  console.log('3. Login as ICT Admin (ict@greenwood.edu / password123)');
  console.log('4. Go to School Management');
  console.log('5. Click "Bulk Upload Students"');
  console.log('6. Select "Greenwood School"');
  console.log('7. Upload this file');
  console.log('8. Check browser console for detailed logs');
})();
