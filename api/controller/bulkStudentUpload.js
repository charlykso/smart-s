const XLSX = require('xlsx');
const bcrypt = require('bcryptjs');
const User = require('../model/User');
const Profile = require('../model/Profile');
const Address = require('../model/Address');
const ClassArm = require('../model/ClassArm');
const School = require('../model/School');
const fs = require('fs');
const path = require('path');

// Helper function to auto-update class arm student count
const autoUpdateClassArmStudentCount = async (classArmId, options = {}) => {
  try {
    const studentCount = await User.countDocuments({ 
      classArm: classArmId, 
      roles: 'Student' 
    });
    
    await ClassArm.findByIdAndUpdate(classArmId, {
      totalNumberOfStudents: studentCount
    });
    
    if (!options.silent) {
      console.log(`Updated class arm ${classArmId} student count to ${studentCount}`);
    }
  } catch (error) {
    console.error('Error updating class arm student count:', error);
  }
};

// Validate Excel data
const validateStudentData = (student, rowIndex) => {
  const errors = [];
  const requiredFields = [
    'firstname', 'lastname', 'email', 'phone', 'regNo', 
    'gender', 'DOB', 'classArm', 'type'
  ];

  // Check required fields
  requiredFields.forEach(field => {
    if (!student[field] || student[field].toString().trim() === '') {
      errors.push(`Row ${rowIndex}: ${field} is required`);
    }
  });

  // Validate email format
  if (student.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
    errors.push(`Row ${rowIndex}: Invalid email format`);
  }

  // Validate gender
  if (student.gender && !['Male', 'Female'].includes(student.gender)) {
    errors.push(`Row ${rowIndex}: Gender must be 'Male' or 'Female'`);
  }

  // Validate type
  if (student.type && !['day', 'boarding'].includes(student.type)) {
    errors.push(`Row ${rowIndex}: Type must be 'day' or 'boarding'`);
  }

  // Validate phone number (basic check)
  if (student.phone && !/^\+?[\d\s\-\(\)]+$/.test(student.phone)) {
    errors.push(`Row ${rowIndex}: Invalid phone number format`);
  }

  return errors;
};

// Generate default password
const generateDefaultPassword = (firstname, regNo) => {
  return `${firstname.toLowerCase()}${regNo.slice(-3)}2024`;
};

// Process Excel file and create students
exports.bulkUploadStudents = async (req, res) => {
  try {
    const { school_id } = req.body;

    // Validate school_id
    if (!school_id) {
      return res.status(400).json({
        success: false,
        message: 'School ID is required'
      });
    }

    // Verify school exists and user has access
    const school = await School.findById(school_id);
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    // Check if user has access to this school (unless Admin)
    if (!req.user.roles.includes('Admin')) {
      const userSchool = req.user.school?._id || req.user.school;
      if (userSchool.toString() !== school_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied - you can only upload students to your own school'
        });
      }
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Excel file is required'
      });
    }

    // Read Excel file
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Excel file is empty or has no valid data'
      });
    }

    // Validate all data first
    const validationErrors = [];
    const processedData = [];

    for (let i = 0; i < jsonData.length; i++) {
      const student = jsonData[i];
      const rowIndex = i + 2; // Excel row number (accounting for header)

      // Validate student data
      const errors = validateStudentData(student, rowIndex);
      validationErrors.push(...errors);

      // Check for duplicate regNo in the file
      const duplicateInFile = processedData.find(s => s.regNo === student.regNo);
      if (duplicateInFile) {
        validationErrors.push(`Row ${rowIndex}: Duplicate regNo '${student.regNo}' found in file`);
      }

      processedData.push(student);
    }

    // If there are validation errors, return them
    if (validationErrors.length > 0) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Validation errors found',
        errors: validationErrors
      });
    }

    // Check for existing users and class arms
    const regNos = processedData.map(s => s.regNo);
    const emails = processedData.map(s => s.email);
    const classArmNames = [...new Set(processedData.map(s => s.classArm))];

    const existingUsers = await User.find({
      $or: [
        { regNo: { $in: regNos } },
        { email: { $in: emails } }
      ]
    });

    const existingClassArms = await ClassArm.find({
      school: school_id,
      name: { $in: classArmNames }
    });

    // Check for conflicts
    const conflicts = [];
    existingUsers.forEach(user => {
      if (regNos.includes(user.regNo)) {
        conflicts.push(`RegNo '${user.regNo}' already exists`);
      }
      if (emails.includes(user.email)) {
        conflicts.push(`Email '${user.email}' already exists`);
      }
    });

    if (conflicts.length > 0) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Duplicate records found',
        conflicts: conflicts
      });
    }

    // Create missing class arms
    const classArmMap = {};
    for (const classArm of existingClassArms) {
      classArmMap[classArm.name] = classArm._id;
    }

    for (const className of classArmNames) {
      if (!classArmMap[className]) {
        const newClassArm = new ClassArm({
          school: school_id,
          name: className,
          totalNumberOfStudents: 0
        });
        const savedClassArm = await newClassArm.save();
        classArmMap[className] = savedClassArm._id;
      }
    }

    // Create default address for students without specific address
    const defaultAddress = new Address({
      country: 'Nigeria',
      state: 'Unknown',
      town: 'Unknown',
      street: 'Unknown',
      street_no: 1,
      zip_code: 000000
    });
    const savedDefaultAddress = await defaultAddress.save();

    // Process and create students
    const results = {
      successful: [],
      failed: []
    };

    for (let i = 0; i < processedData.length; i++) {
      const studentData = processedData[i];
      const rowIndex = i + 2;

      try {
        // Create profile
        const profile = new Profile({});
        const savedProfile = await profile.save();

        // Generate password
        const defaultPassword = generateDefaultPassword(studentData.firstname, studentData.regNo);
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        // Create student
        const student = new User({
          school: school_id,
          firstname: studentData.firstname.trim(),
          middlename: studentData.middlename ? studentData.middlename.trim() : '',
          lastname: studentData.lastname.trim(),
          regNo: studentData.regNo.trim(),
          email: studentData.email.trim().toLowerCase(),
          phone: studentData.phone.trim(),
          address: savedDefaultAddress._id,
          profile: savedProfile._id,
          DOB: new Date(studentData.DOB),
          gender: studentData.gender,
          classArm: classArmMap[studentData.classArm],
          type: studentData.type,
          roles: ['Student'],
          password: hashedPassword,
          status: 'active',
          isActive: true
        });

        await student.save();

        // Update class arm student count
        await autoUpdateClassArmStudentCount(classArmMap[studentData.classArm], { silent: true });

        results.successful.push({
          row: rowIndex,
          regNo: studentData.regNo,
          name: `${studentData.firstname} ${studentData.lastname}`,
          email: studentData.email,
          password: defaultPassword
        });

      } catch (error) {
        results.failed.push({
          row: rowIndex,
          regNo: studentData.regNo,
          name: `${studentData.firstname} ${studentData.lastname}`,
          error: error.message
        });
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      success: true,
      message: `Bulk upload completed. ${results.successful.length} students created successfully, ${results.failed.length} failed.`,
      data: {
        totalProcessed: processedData.length,
        successful: results.successful.length,
        failed: results.failed.length,
        results: results
      }
    });

  } catch (error) {
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during bulk upload',
      error: error.message
    });
  }
};

// Download Excel template
exports.downloadStudentTemplate = async (req, res) => {
  try {
    // Create sample data for the template
    const templateData = [
      {
        firstname: 'John',
        middlename: 'Michael',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        phone: '+2348012345678',
        regNo: 'STU001',
        gender: 'Male',
        DOB: '2005-01-15',
        classArm: 'JSS 1',
        type: 'day'
      },
      {
        firstname: 'Jane',
        middlename: 'Mary',
        lastname: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+2348012345679',
        regNo: 'STU002',
        gender: 'Female',
        DOB: '2005-03-20',
        classArm: 'JSS 1',
        type: 'boarding'
      }
    ];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=student_upload_template.xlsx');

    res.send(buffer);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating template',
      error: error.message
    });
  }
};

module.exports = {
  bulkUploadStudents: exports.bulkUploadStudents,
  downloadStudentTemplate: exports.downloadStudentTemplate
};
