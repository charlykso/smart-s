const User = require('../model/User')
const bcrypt = require('bcryptjs')
const Profile = require('../model/Profile')
const { autoUpdateClassArmStudentCount } = require('../helpers/classArmHelpers')
// Import GroupSchool for the helper function
const GroupSchool = require('../model/GroupSchool')

// Helper function to check if a proprietor already exists for a GroupSchool
const checkExistingProprietorInGroupSchool = async (
  schoolId,
  excludeUserId = null
) => {
  const School = require('../model/School')

  // Get the school without populate to avoid hanging
  const school = await School.findById(schoolId)
  if (!school) {
    throw new Error('School not found')
  }

  if (!school.groupSchool) {
    throw new Error('School is not associated with a GroupSchool')
  }

  // Get the GroupSchool separately
  const groupSchoolId = school.groupSchool
  const groupSchool = await GroupSchool.findById(groupSchoolId)
  if (!groupSchool) {
    throw new Error('GroupSchool not found')
  }

  // Find all schools in the same GroupSchool
  const schoolsInGroup = await School.find({ groupSchool: groupSchoolId })
  const schoolIdsInGroup = schoolsInGroup.map((s) => s._id)

  // Check for existing proprietor
  const query = {
    school: { $in: schoolIdsInGroup },
    roles: 'Proprietor',
  }

  // Exclude current user if updating
  if (excludeUserId) {
    query._id = { $ne: excludeUserId }
  }

  const existingProprietor = await User.findOne(query)

  return {
    exists: !!existingProprietor,
    proprietor: existingProprietor,
    groupSchool: groupSchool,
    school: school,
  }
}

const getAllUsers = async (req, res) => {
  try {
    // This endpoint should only be accessible to general Admins
    const userRoles = req.user.roles || []
    const userSchool = req.user.school?._id || req.user.school

    if (!userRoles.includes('Admin') || userSchool) {
      return res.status(403).json({
        success: false,
        message:
          'Access denied - only general administrators can access all users',
      })
    }

    const users = await User.find()
      .select('-password -__v')
      .populate('school', 'name')
      .populate('classArm', 'name')
      .populate('profile', 'img')

    res.status(200).json({
      success: true,
      data: users,
      message: 'All users retrieved successfully',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.getICT_administrators = async (req, res) => {
  try {
    // Apply school filtering - all users except general Admin must have school filter
    let query = { roles: 'ICT_administrator' }

    if (req.schoolFilter) {
      query = { ...query, ...req.schoolFilter }
    }

    const ICT_administrators = await User.find(query)
      .select('-password -__v')
      .populate('profile', 'img')
      .populate('school', 'name')

    res.status(200).json({
      success: true,
      data: ICT_administrators,
      message: 'ICT administrators retrieved successfully',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.getAuditors = async (req, res) => {
  try {
    const auditors = await User.find({ roles: 'Auditor' })
      .select('-password -__v')
      .populate('profile', 'img')
    res.status(200).json(auditors)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getProprietors = async (req, res) => {
  try {
    const proprietors = await User.find({ roles: 'Proprietor' })
      .select('-password -__v')
      .populate('profile', 'img')
    res.status(200).json(proprietors)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
exports.getPrincipals = async (req, res) => {
  try {
    const principals = await User.find({ roles: 'Principal' })
      .select('-password -__v')
      .populate('profile', 'img')
    res.status(200).json(principals)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getHeadteachers = async (req, res) => {
  try {
    const headteachers = await User.find({ roles: 'Headteacher' })
      .select('-password -__v')
      .populate('profile', 'img')
    res.status(200).json(headteachers)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
exports.getBursars = async (req, res) => {
  try {
    const bursars = await User.find({ roles: 'Bursar' })
      .select('-password -__v')
      .populate('profile', 'img')
    res.status(200).json(bursars)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getStudents = async (req, res) => {
  try {
    // Apply school filtering - all users except general Admin must have school filter
    let query = { roles: 'Student' }

    if (req.schoolFilter) {
      query = { ...query, ...req.schoolFilter }
    }

    const students = await User.find(query)
      .select('-password -__v')
      .populate('profile', 'img')
      .populate('school', 'name')
      .populate('classArm', 'name')

    res.status(200).json({
      success: true,
      data: students,
      message: 'Students retrieved successfully',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
exports.getParents = async (req, res) => {
  try {
    // Apply school filtering - all users except general Admin must have school filter
    let query = { roles: 'Parent' }

    if (req.schoolFilter) {
      query = { ...query, ...req.schoolFilter }
    }

    const parents = await User.find(query)
      .select('-password -__v')
      .populate('school', 'name')
      .populate('student', 'firstname lastname regNo')

    res.status(200).json({
      success: true,
      data: parents,
      message: 'Parents retrieved successfully',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.getStudentsInParticularSchool = async (req, res) => {
  try {
    const school_id = req.params.school_id
    const students = await User.find({
      roles: 'Student',
      school: school_id,
    })
      .select('-password -__v')
      .populate('school', 'name')
      .populate('classArm', 'name')
      .populate('profile')
    if (students.length === 0) {
      return res
        .status(404)
        .json({ message: 'No students found for this school' })
    }
    res.status(200).json({
      status: 'success',
      totalNumber: students.length,
      students: students,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getParentsInParticularSchool = async (req, res) => {
  try {
    const parents = await User.find({
      roles: 'Parent',
      school_id: req.params.school_id,
    })
      .select('-password -__v')
      .populate('profile', 'img')
    res.status(200).json(parents)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getICT_administrator = async (req, res) => {
  try {
    const ICT_administrator = await User.findById({
      roles: 'ICT_administrator',
      _id: req.params.id,
    })
      .select('-password -__v')
      .populate('name')
    res.status(200).json(ICT_administrator)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getAuditor = async (req, res) => {
  try {
    const auditor = await User.findById({
      roles: 'auditor',
      _id: req.params.id,
    })
      .select('-password -__v')
      .populate('name')
    res.status(200).json(auditor)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getProprietor = async (req, res) => {
  try {
    const proprietor = await User.findById({
      roles: 'proprietor',
      _id: req.params.id,
    })
      .select('-password -__v')
      .populate('name')
    res.status(200).json(proprietor)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getPrincipal = async (req, res) => {
  try {
    const principal = await User.findById({
      roles: 'principal',
      _id: req.params.id,
    })
      .select('-password -__v')
      .populate('school', 'name')
      .populate('profile', 'name')
    res.status(200).json(principal)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getHeadteacher = async (req, res) => {
  try {
    const headteacher = await User.findOne({
      roles: 'headteacher',
      _id: req.params.id,
    })
      .select('-password -__v')
      .populate('name')
    res.status(200).json(headteacher)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getBursar = async (req, res) => {
  try {
    const bursar = await User.findById({ roles: 'bursar', _id: req.params.id })
      .select('-password -__v')
      .populate('name')
    res.status(200).json(bursar)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getStudent = async (req, res) => {
  try {
    const student = await User.findById({
      roles: 'student',
      _id: req.params.id,
    }).select('-password -__v')
    res.status(200).json(student)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getParent = async (req, res) => {
  try {
    const parent = await User.findById({ roles: 'parent', _id: req.params.id })
      .select('-password -__v')
      .populate('name')
    res.status(200).json(parent)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.createAdmin = async (req, res) => {
  try {
    const {
      firstname,
      middlename,
      lastname,
      email,
      phone,
      DOB,
      gender,
      roles,
      password,
    } = req.body
    if (
      firstname === '' ||
      middlename === '' ||
      lastname === '' ||
      email === '' ||
      phone === '' ||
      DOB === '' ||
      gender === '' ||
      roles === '' ||
      password === ''
    ) {
      return res.status(400).json({ message: 'All fields are required' })
    }
    const existingUser = await User.findOne({ email: email, phone: phone })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const profile = new Profile({})
    const profile_id = await profile.save()
    const admin = new User({
      firstname,
      middlename,
      lastname,
      email,
      phone,
      profile: profile_id,
      DOB,
      gender,
      roles: ['Admin'],
      password: hashedPassword,
    })
    await admin.save()
    res.status(201).json({ message: 'Admin and profile created successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
exports.createICT_administrator = async (req, res) => {
  try {
    const {
      school_id,
      firstname,
      middlename,
      lastname,
      email,
      phone,
      address_id,
      DOB,
      gender,
      roles,
      password,
    } = req.body
    if (
      school_id === '' ||
      firstname === '' ||
      middlename === '' ||
      lastname === '' ||
      email === '' ||
      phone === '' ||
      address_id === '' ||
      DOB === '' ||
      gender === '' ||
      roles === '' ||
      password === ''
    ) {
      return res.status(400).json({ message: 'All fields are required' })
    }
    const existingUser = await User.findOne({ email: email, phone: phone })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const profile = new Profile({})
    const profile_id = await profile.save()
    const ICT_administrator = new User({
      school: school_id,
      firstname,
      middlename,
      lastname,
      email,
      phone,
      address: address_id,
      profile: profile_id,
      DOB,
      gender,
      roles: ['ICT_administrator'],
      password: hashedPassword,
    })
    await ICT_administrator.save()
    res
      .status(201)
      .json({ message: 'ICT administrator and profile created successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.createAuditor = async (req, res) => {
  try {
    const {
      school_id,
      firstname,
      middlename,
      lastname,
      email,
      phone,
      address_id,
      DOB,
      gender,
      roles,
      password,
    } = req.body
    if (
      school_id === '' ||
      firstname === '' ||
      middlename === '' ||
      lastname === '' ||
      email === '' ||
      phone === '' ||
      address_id === '' ||
      DOB === '' ||
      gender === '' ||
      roles === '' ||
      password === ''
    ) {
      return res.status(400).json({ message: 'All fields are required' })
    }
    const existingUser = await User.findOne({ email: email, phone: phone })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const profile = new Profile({})
    const profile_id = await profile.save()
    const auditor = new User({
      school: school_id,
      firstname,
      middlename,
      lastname,
      email,
      phone,
      address: address_id,
      profile: profile_id,
      DOB,
      gender,
      roles: ['Auditor'],
      password: hashedPassword,
    })
    await auditor.save()
    res
      .status(201)
      .json({ message: 'Auditor and profile created successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.createProprietor = async (req, res) => {
  try {
    const {
      school_id,
      firstname,
      middlename,
      lastname,
      email,
      phone,
      address_id,
      DOB,
      gender,
      roles,
      password,
    } = req.body
    if (
      school_id === '' ||
      firstname === '' ||
      middlename === '' ||
      lastname === '' ||
      email === '' ||
      phone === '' ||
      address_id === '' ||
      DOB === '' ||
      gender === '' ||
      roles === '' ||
      password === ''
    ) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email, phone: phone })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Check if a Proprietor already exists for this GroupSchool
    const proprietorCheck = await checkExistingProprietorInGroupSchool(
      school_id
    )
    if (proprietorCheck.exists) {
      return res.status(409).json({
        message: `A Proprietor already exists for this Group School (${proprietorCheck.groupSchool.name}). Only one Proprietor is allowed per Group School.`,
        existingProprietor: {
          name: `${proprietorCheck.proprietor.firstname} ${proprietorCheck.proprietor.lastname}`,
          email: proprietorCheck.proprietor.email,
          school: proprietorCheck.school.name,
        },
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const profile = new Profile({})
    const profile_id = await profile.save()
    const proprietor = new User({
      school: school_id,
      firstname,
      middlename,
      lastname,
      email,
      phone,
      address: address_id,
      profile: profile_id,
      DOB,
      gender,
      roles: ['Proprietor'],
      password: hashedPassword,
    })
    await proprietor.save()
    res.status(201).json({ message: 'Proprietor created successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
exports.createPrincipal = async (req, res) => {
  try {
    const {
      school_id,
      firstname,
      middlename,
      lastname,
      email,
      phone,
      address_id,
      DOB,
      gender,
      roles,
      password,
    } = req.body
    if (
      school_id === '' ||
      firstname === '' ||
      middlename === '' ||
      lastname === '' ||
      email === '' ||
      phone === '' ||
      address_id === '' ||
      DOB === '' ||
      gender === '' ||
      roles === '' ||
      password === ''
    ) {
      return res.status(400).json({ message: 'All fields are required' })
    }
    const existingUser = await User.findOne({ email: email, phone: phone })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const profile = new Profile({})
    const profile_id = await profile.save()
    const principal = new User({
      school: school_id,
      firstname,
      middlename,
      lastname,
      email,
      phone,
      address: address_id,
      profile: profile_id,
      DOB,
      gender,
      roles: ['Principal'],
      password: hashedPassword,
    })
    await principal.save()
    res.status(201).json({ message: 'Principal created successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
exports.createHeadteacher = async (req, res) => {
  try {
    const {
      school_id,
      firstname,
      middlename,
      lastname,
      email,
      phone,
      address_id,
      DOB,
      gender,
      roles,
      password,
    } = req.body
    if (
      school_id === '' ||
      firstname === '' ||
      middlename === '' ||
      lastname === '' ||
      email === '' ||
      phone === '' ||
      address_id === '' ||
      DOB === '' ||
      gender === '' ||
      roles === '' ||
      password === ''
    ) {
      return res.status(400).json({ message: 'All fields are required' })
    }
    const existingUser = await User.findOne({ email: email, phone: phone })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const profile = new Profile({})
    const profile_id = await profile.save()
    const headteacher = new User({
      school: school_id,
      firstname,
      middlename,
      lastname,
      email,
      phone,
      address: address_id,
      profile: profile_id,
      DOB,
      gender,
      roles: ['Headteacher'],
      password: hashedPassword,
    })
    await headteacher.save()
    res.status(201).json({ message: 'Headteacher created successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
exports.createBursar = async (req, res) => {
  try {
    const {
      school_id,
      firstname,
      middlename,
      lastname,
      email,
      phone,
      address_id,
      DOB,
      gender,
      roles,
      password,
    } = req.body
    if (
      school_id === '' ||
      firstname === '' ||
      middlename === '' ||
      lastname === '' ||
      email === '' ||
      phone === '' ||
      address_id === '' ||
      DOB === '' ||
      gender === '' ||
      roles === '' ||
      password === ''
    ) {
      return res.status(400).json({ message: 'All fields are required' })
    }
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const profile = new Profile({})
    const profile_id = await profile.save()
    const bursar = new User({
      school: school_id,
      firstname,
      middlename,
      lastname,
      email,
      phone,
      address: address_id,
      profile: profile_id,
      DOB,
      gender,
      roles: ['Bursar'],
      password: hashedPassword,
    })
    await bursar.save()
    res.status(201).json({ message: 'Bursar created successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
exports.createStudent = async (req, res) => {
  try {
    const {
      school_id,
      firstname,
      middlename,
      lastname,
      regNo,
      email,
      phone,
      address_id,
      DOB,
      gender,
      classArm_id,
      type,
      roles,
      password,
    } = req.body

    // Validate required fields
    if (
      school_id === '' ||
      firstname === '' ||
      middlename === '' ||
      lastname === '' ||
      regNo === '' ||
      email === '' ||
      phone === '' ||
      address_id === '' ||
      DOB === '' ||
      gender === '' ||
      classArm_id === '' ||
      type === '' ||
      roles === '' ||
      password === ''
    ) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    // School access validation
    const userSchool = req.user.school?._id || req.user.school
    const userRoles = req.user.roles || []

    // Only Admin can create students for any school
    if (!userRoles.includes('Admin')) {
      // Proprietor and ICT_administrator can only create students for their own school
      if (!userSchool) {
        return res.status(403).json({
          message: 'User must belong to a school to create students',
        })
      }

      if (userSchool.toString() !== school_id) {
        return res.status(403).json({
          message:
            'Access denied - can only create students for your own school',
        })
      }
    }
    const existingUser = await User.findOne({ regNo: regNo })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const profile = new Profile({})
    const profile_id = await profile.save()
    const student = new User({
      school: school_id,
      firstname,
      middlename,
      lastname,
      regNo,
      email,
      phone,
      address: address_id,
      profile: profile_id,
      DOB,
      gender,
      classArm: classArm_id,
      type,
      roles: ['Student'],
      password: hashedPassword,
    })
    await student.save()

    // Auto-update classArm student count
    if (classArm_id) {
      await autoUpdateClassArmStudentCount(classArm_id, { silent: true })
    }

    res.status(201).json({ message: 'Student created successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
exports.createParent = async (req, res) => {
  try {
    const {
      school_id,
      firstname,
      middlename,
      lastname,
      student_id,
      email,
      phone,
      address_id,
      DOB,
      gender,
      roles,
      password,
    } = req.body
    if (
      school_id === '' ||
      firstname === '' ||
      middlename === '' ||
      lastname === '' ||
      student_id === '' ||
      email === '' ||
      phone === '' ||
      address_id === '' ||
      DOB === '' ||
      gender === '' ||
      roles === '' ||
      password === ''
    ) {
      return res.status(400).json({ message: 'All fields are required' })
    }
    const student = await User.findById(student_id)
    if (!student) {
      return res.status(404).json({ message: 'Student not found' })
    }

    const existingUser = await User.findOne({ email: email, phone: phone })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const profile = new Profile({})
    const profile_id = await profile.save()
    const parent = new User({
      school: school_id,
      firstname,
      middlename,
      lastname,
      student: student_id,
      email,
      phone,
      address: address_id,
      profile: profile_id,
      DOB,
      gender,
      roles: ['Parent'],
      password: hashedPassword,
    })
    await parent.save()
    res.status(201).json({ message: 'Parent created successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.updateICT_administrator = async (req, res) => {
  try {
    const { id } = req.params
    const {
      school_id,
      firstname,
      middlename,
      lastname,
      email,
      phone,
      address_id,
      DOB,
      gender,
      roles,
    } = req.body
    if (
      school_id === '' ||
      firstname === '' ||
      middlename === '' ||
      lastname === '' ||
      email === '' ||
      phone === '' ||
      address_id === '' ||
      DOB === '' ||
      gender === '' ||
      roles === ''
    ) {
      return res.status(400).json({ message: 'All fields are required' })
    }
    const ict_administrator = await User.findByIdAndUpdate(
      id,
      {
        school_id,
        firstname,
        middlename,
        lastname,
        email,
        phone,
        address_id,
        DOB,
        gender,
        roles,
      },
      { new: true }
    )
    if (!ict_administrator) {
      return res.status(404).json({ message: 'ICT administrator not found' })
    }
    res.status(200).json({ message: 'ICT administrator updated successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.updateAuditor = async (req, res) => {
  try {
    const { id } = req.params
    const {
      school_id,
      firstname,
      middlename,
      lastname,
      email,
      phone,
      address_id,
      DOB,
      gender,
      roles,
    } = req.body
    if (
      school_id === '' ||
      firstname === '' ||
      middlename === '' ||
      lastname === '' ||
      email === '' ||
      phone === '' ||
      address_id === '' ||
      DOB === '' ||
      gender === '' ||
      roles === ''
    ) {
      return res.status(400).json({ message: 'All fields are required' })
    }
    const auditor = await User.findByIdAndUpdate(
      id,
      {
        school_id,
        firstname,
        middlename,
        lastname,
        email,
        phone,
        address_id,
        DOB,
        gender,
        roles,
      },
      { new: true }
    )
    if (!auditor) {
      return res.status(404).json({ message: 'Auditor not found' })
    }
    res.status(200).json({ message: 'Auditor updated successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.updateProprietor = async (req, res) => {
  try {
    const { id } = req.params
    const {
      school_id,
      firstname,
      middlename,
      lastname,
      email,
      phone,
      address_id,
      DOB,
      gender,
      roles,
    } = req.body
    if (
      school_id === '' ||
      firstname === '' ||
      middlename === '' ||
      lastname === '' ||
      email === '' ||
      phone === '' ||
      address_id === '' ||
      DOB === '' ||
      gender === '' ||
      roles === ''
    ) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    // Get current proprietor to check if school is changing
    const currentProprietor = await User.findById(id)
    if (!currentProprietor) {
      return res.status(404).json({ message: 'Proprietor not found' })
    }

    // If school is changing, check if new school's GroupSchool already has a proprietor
    if (school_id !== currentProprietor.school.toString()) {
      const proprietorCheck = await checkExistingProprietorInGroupSchool(
        school_id,
        id
      )
      if (proprietorCheck.exists) {
        return res.status(409).json({
          message: `A Proprietor already exists for this Group School (${proprietorCheck.groupSchool.name}). Only one Proprietor is allowed per Group School.`,
          existingProprietor: {
            name: `${proprietorCheck.proprietor.firstname} ${proprietorCheck.proprietor.lastname}`,
            email: proprietorCheck.proprietor.email,
            school: proprietorCheck.school.name,
          },
        })
      }
    }

    const proprietor = await User.findByIdAndUpdate(
      id,
      {
        school: school_id,
        firstname,
        middlename,
        lastname,
        email,
        phone,
        address: address_id,
        DOB,
        gender,
        roles,
      },
      { new: true }
    )
    if (!proprietor) {
      return res.status(404).json({ message: 'Proprietor not found' })
    }

    res.status(200).json({ message: 'Proprietor updated successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.updatePrincipal = async (req, res) => {
  try {
    const { id } = req.params
    const {
      school_id,
      firstname,
      middlename,
      lastname,
      email,
      phone,
      address_id,
      DOB,
      gender,
      roles,
    } = req.body
    if (
      school_id === '' ||
      firstname === '' ||
      middlename === '' ||
      lastname === '' ||
      email === '' ||
      phone === '' ||
      address_id === '' ||
      DOB === '' ||
      gender === '' ||
      roles === ''
    ) {
      return res.status(400).json({ message: 'All fields are required' })
    }
    const principal = await User.findByIdAndUpdate(
      id,
      {
        school_id,
        firstname,
        middlename,
        lastname,
        email,
        phone,
        address_id,
        DOB,
        gender,
        roles,
      },
      { new: true }
    )
    if (!principal) {
      return res.status(404).json({ message: 'Principal not found' })
    }
    res.status(200).json({ message: 'Principal updated successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.updateHeadteacher = async (req, res) => {
  try {
    const { id } = req.params
    const {
      school_id,
      firstname,
      middlename,
      lastname,
      email,
      phone,
      address_id,
      DOB,
      gender,
      roles,
    } = req.body
    if (
      school_id === '' ||
      firstname === '' ||
      middlename === '' ||
      lastname === '' ||
      email === '' ||
      phone === '' ||
      address_id === '' ||
      DOB === '' ||
      gender === '' ||
      roles === ''
    ) {
      return res.status(400).json({ message: 'All fields are required' })
    }
    const headteacher = await User.findByIdAndUpdate(
      id,
      {
        school_id,
        firstname,
        middlename,
        lastname,
        email,
        phone,
        address_id,
        DOB,
        gender,
        roles,
      },
      { new: true }
    )
    if (!headteacher) {
      return res.status(404).json({ message: 'Headteacher not found' })
    }
    res.status(200).json({ message: 'Headteacher updated successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.updateBursar = async (req, res) => {
  try {
    const { id } = req.params
    const {
      school_id,
      firstname,
      middlename,
      lastname,
      email,
      phone,
      address_id,
      DOB,
      gender,
      roles,
    } = req.body
    if (
      school_id === '' ||
      firstname === '' ||
      middlename === '' ||
      lastname === '' ||
      email === '' ||
      phone === '' ||
      address_id === '' ||
      DOB === '' ||
      gender === '' ||
      roles === ''
    ) {
      return res.status(400).json({ message: 'All fields are required' })
    }
    const bursar = await User.findByIdAndUpdate(
      id,
      {
        school_id,
        firstname,
        middlename,
        lastname,
        email,
        phone,
        address_id,
        DOB,
        gender,
        roles,
      },
      { new: true }
    )
    if (!bursar) {
      return res.status(404).json({ message: 'Bursar not found' })
    }
    res.status(200).json({ message: 'Bursar updated successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params
    const {
      school_id,
      firstname,
      middlename,
      lastname,
      regNo,
      email,
      phone,
      address_id,
      DOB,
      gender,
      classArm_id,
      type,
      role,
    } = req.body
    if (
      school_id === '' ||
      firstname === '' ||
      middlename === '' ||
      lastname === '' ||
      regNo === '' ||
      email === '' ||
      phone === '' ||
      address_id === '' ||
      DOB === '' ||
      gender === '' ||
      classArm_id === '' ||
      type === '' ||
      role === ''
    ) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    // Get the current student to check if classArm is changing
    const currentStudent = await User.findById(id)
    if (!currentStudent) {
      return res.status(404).json({ message: 'Student not found' })
    }

    // School access validation
    const userSchool = req.user.school?._id || req.user.school
    const userRoles = req.user.roles || []

    // Only Admin can update students for any school
    if (!userRoles.includes('Admin')) {
      // Proprietor and ICT_administrator can only update students for their own school
      if (!userSchool) {
        return res.status(403).json({
          message: 'User must belong to a school to update students',
        })
      }

      // Check if the student belongs to the user's school
      const studentSchool = currentStudent.school?._id || currentStudent.school
      if (userSchool.toString() !== studentSchool.toString()) {
        return res.status(403).json({
          message:
            'Access denied - can only update students from your own school',
        })
      }

      // Also check if the new school_id (if provided) matches user's school
      if (school_id && userSchool.toString() !== school_id) {
        return res.status(403).json({
          message:
            'Access denied - can only assign students to your own school',
        })
      }
    }
    const oldClassArmId = currentStudent.classArm?.toString()
    const newClassArmId = classArm_id

    await User.findByIdAndUpdate(
      id,
      {
        school: school_id,
        firstname,
        middlename,
        lastname,
        regNo,
        email,
        phone,
        address: address_id,
        DOB,
        gender,
        classArm: classArm_id,
        type,
        roles: role,
      },
      { new: true }
    )

    // Auto-update classArm student counts if classArm changed
    if (oldClassArmId !== newClassArmId) {
      const classArmsToUpdate = []
      if (oldClassArmId) classArmsToUpdate.push(oldClassArmId)
      if (newClassArmId) classArmsToUpdate.push(newClassArmId)

      if (classArmsToUpdate.length > 0) {
        await autoUpdateClassArmStudentCount(classArmsToUpdate, {
          silent: true,
        })
      }
    }

    res.status(200).json({ message: 'Student updated successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.updateParent = async (req, res) => {
  try {
    const { id } = req.params
    const {
      school_id,
      firstname,
      middlename,
      lastname,
      student_id,
      email,
      phone,
      address_id,
      DOB,
      gender,
      roles,
    } = req.body
    if (
      school_id === '' ||
      firstname === '' ||
      middlename === '' ||
      lastname === '' ||
      student_id === '' ||
      email === '' ||
      phone === '' ||
      address_id === '' ||
      DOB === '' ||
      gender === '' ||
      roles === ''
    ) {
      return res.status(400).json({ message: 'All fields are required' })
    }
    const parent = await User.findByIdAndUpdate(
      id,
      {
        school_id,
        firstname,
        middlename,
        lastname,
        student_id,
        email,
        phone,
        address_id,
        DOB,
        gender,
        roles,
      },
      { new: true }
    )
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' })
    }
    res.status(200).json({ message: 'Parent updated successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.deleteICT_administrator = async (req, res) => {
  try {
    const { id } = req.params
    const ICT_administrator = await User.findByIdAndDelete(id)
    if (!ICT_administrator) {
      return res.status(404).json({ message: 'ICT administrator not found' })
    }
    res.status(200).json({ message: 'ICT administrator deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.deleteAuditor = async (req, res) => {
  try {
    const { id } = req.params
    const auditor = await User.findByIdAndDelete(id)
    if (!auditor) {
      return res.status(404).json({ message: 'Auditor not found' })
    }
    res.status(200).json({ message: 'Auditor deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
exports.deleteProprietor = async (req, res) => {
  try {
    const { id } = req.params
    const proprietor = await User.findByIdAndDelete(id)
    if (!proprietor) {
      return res.status(404).json({ message: 'Proprietor not found' })
    }
    res.status(200).json({ message: 'Proprietor deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.deletePrincipal = async (req, res) => {
  try {
    const { id } = req.params
    const principal = await User.findByIdAndDelete(id)
    if (!principal) {
      return res.status(404).json({ message: 'Principal not found' })
    }
    res.status(200).json({ message: 'Principal deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.deleteHeadteacher = async (req, res) => {
  try {
    const { id } = req.params
    const headteacher = await User.findByIdAndDelete(id)
    if (!headteacher) {
      return res.status(404).json({ message: 'Headteacher not found' })
    }
    res.status(200).json({ message: 'Headteacher deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.deleteBursar = async (req, res) => {
  try {
    const { id } = req.params
    const bursar = await User.findByIdAndDelete(id)
    if (!bursar) {
      return res.status(404).json({ message: 'Bursar not found' })
    }
    res.status(200).json({ message: 'Bursar deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params

    // Get the student before deleting to get the classArm
    const student = await User.findById(id)
    if (!student) {
      return res.status(404).json({ message: 'Student not found' })
    }

    // School access validation
    const userSchool = req.user.school?._id || req.user.school
    const userRoles = req.user.roles || []

    // Only Admin can delete students from any school
    if (!userRoles.includes('Admin')) {
      // Proprietor and ICT_administrator can only delete students from their own school
      if (!userSchool) {
        return res.status(403).json({
          message: 'User must belong to a school to delete students',
        })
      }

      // Check if the student belongs to the user's school
      const studentSchool = student.school?._id || student.school
      if (userSchool.toString() !== studentSchool.toString()) {
        return res.status(403).json({
          message:
            'Access denied - can only delete students from your own school',
        })
      }
    }

    const classArmId = student.classArm?.toString()

    // Delete the student
    await User.findByIdAndDelete(id)

    // Auto-update classArm student count
    if (classArmId) {
      await autoUpdateClassArmStudentCount(classArmId, { silent: true })
    }

    res.status(200).json({ message: 'Student deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.deleteParent = async (req, res) => {
  try {
    const { id } = req.params
    const parent = await User.findByIdAndDelete(id)
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' })
    }
    res.status(200).json({ message: 'Parent deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getStaffBySchool = async (req, res) => {
  try {
    const { school_id } = req.params

    const staffMembers = await User.find({
      school: school_id,
      roles: { $ne: 'Student' }, // exclude students
    })
      .select('-password -__v')
      .populate('school', 'name')
      .populate('profile')

    if (!staffMembers || staffMembers.length === 0) {
      return res
        .status(404)
        .json({ message: 'No staff members found for this school' })
    }

    const formattedStaff = staffMembers.map((member) => ({
      _id: member._id,
      name: member.name,
      email: member.email,
      roles: member.roles,
      school: member.school?.name || null,
      profile: member.profile || null,
    }))

    res.status(200).json({
      status: 'success',
      total: formattedStaff.length,
      staff: formattedStaff,
    })
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching staff members',
      error: error.message,
    })
  }
}

// Get current user profile
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user

    // Get user data with populated fields
    const user = await User.findById(userId)
      .select('-password -__v')
      .populate({
        path: 'school',
        select: 'name email phoneNumber',
        populate: {
          path: 'groupSchool',
          select: 'name description logo',
        },
      })
      .populate('classArm', 'name')
      .populate('profile')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message,
    })
  }
}

// Bulk delete users
const bulkDeleteUsers = async (req, res) => {
  try {
    const { userIds } = req.body

    // Validate input
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required and cannot be empty',
      })
    }

    // Check if current user has permission to delete users
    const currentUser = await User.findById(req.user.id)
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      })
    }

    // Only Admin and ICT_administrator can bulk delete users
    const canDelete = currentUser.roles.some((role) =>
      ['Admin', 'ICT_administrator'].includes(role)
    )

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to delete users',
      })
    }

    // Get users to be deleted for validation
    const usersToDelete = await User.find({ _id: { $in: userIds } }).populate(
      'school',
      'name groupSchool'
    )

    if (usersToDelete.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No users found with provided IDs',
      })
    }

    // Validate permissions based on user role
    if (
      currentUser.roles.includes('ICT_administrator') &&
      !currentUser.roles.includes('Admin')
    ) {
      // ICT Admin can only delete users in their group school
      const currentUserSchool = await User.findById(req.user.id).populate(
        'school'
      )

      if (!currentUserSchool.school || !currentUserSchool.school.groupSchool) {
        return res.status(403).json({
          success: false,
          message: 'ICT Administrator not associated with a group school',
        })
      }

      // Check if all users to delete are in the same group school
      const unauthorizedUsers = usersToDelete.filter(
        (user) =>
          !user.school ||
          String(user.school.groupSchool) !==
            String(currentUserSchool.school.groupSchool)
      )

      if (unauthorizedUsers.length > 0) {
        return res.status(403).json({
          success: false,
          message: 'Cannot delete users outside your group school',
        })
      }
    }

    // Prevent deletion of critical users
    const criticalUsers = usersToDelete.filter(
      (user) =>
        user.roles.includes('Admin') ||
        (user.roles.includes('ICT_administrator') &&
          String(user._id) === String(req.user.id))
    )

    if (criticalUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          'Cannot delete Admin users or your own ICT Administrator account',
      })
    }

    // Get profiles to be deleted
    const profilesToDelete = usersToDelete
      .filter((user) => user.profile)
      .map((user) => user.profile)

    // Perform bulk delete operations
    const deletedUsers = await User.deleteMany({ _id: { $in: userIds } })

    // Delete associated profiles
    if (profilesToDelete.length > 0) {
      await Profile.deleteMany({ _id: { $in: profilesToDelete } })
    }

    // Update class arm student counts for deleted students
    const deletedStudents = usersToDelete.filter(
      (user) => user.roles.includes('Student') && user.classArm
    )

    for (const student of deletedStudents) {
      try {
        await autoUpdateClassArmStudentCount(student.classArm)
      } catch (error) {
        console.warn(
          `Failed to update class arm count for ${student.classArm}:`,
          error.message
        )
      }
    }

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${deletedUsers.deletedCount} users`,
      data: {
        deletedCount: deletedUsers.deletedCount,
        requestedCount: userIds.length,
      },
    })
  } catch (error) {
    console.error('Bulk delete users error:', error)
    res.status(500).json({
      success: false,
      message: 'Error deleting users',
      error: error.message,
    })
  }
}

// Bulk update users
const bulkUpdateUsers = async (req, res) => {
  try {
    const { userIds, updates } = req.body

    // Validate input
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required and cannot be empty',
      })
    }

    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Updates object is required',
      })
    }

    // Check permissions
    const currentUser = await User.findById(req.user.id)
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      })
    }

    const canUpdate = currentUser.roles.some((role) =>
      ['Admin', 'ICT_administrator'].includes(role)
    )

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to update users',
      })
    }

    // Clean updates object - remove sensitive fields
    const allowedUpdates = { ...updates }
    delete allowedUpdates.password
    delete allowedUpdates._id
    delete allowedUpdates.__v
    delete allowedUpdates.email // Email changes should be handled separately

    // Perform bulk update
    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: allowedUpdates },
      { new: true }
    )

    res.status(200).json({
      success: true,
      message: `Successfully updated ${result.modifiedCount} users`,
      data: {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount,
      },
    })
  } catch (error) {
    console.error('Bulk update users error:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating users',
      error: error.message,
    })
  }
}

// Export bulk functions the same way as other functions in this file
exports.getAllUsers = getAllUsers
exports.bulkDeleteUsers = bulkDeleteUsers
exports.bulkUpdateUsers = bulkUpdateUsers
