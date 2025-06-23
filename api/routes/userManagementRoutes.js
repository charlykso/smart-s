const express = require('express')
const router = express.Router()
const User = require('../model/User')
const School = require('../model/School')
const bcrypt = require('bcryptjs')
const { authenticate, authorize } = require('../middleware/auth')

// Get users from schools managed by ICT Admin
router.get(
  '/managed-schools',
  authenticate,
  authorize(['ICT_administrator']), // ICT Admin only
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id).populate('school')

      // ICT Admin - must be associated with a group school
      if (!user.school || !user.school.groupSchool) {
        return res.status(400).json({
          message: 'ICT Admin not associated with a group school',
        })
      }

      // Find all schools under the same group school
      const schools = await School.find({
        groupSchool: user.school.groupSchool,
      })

      const schoolIds = schools.map((school) => school._id)

      // Find all users in these schools (excluding ICT_administrator and Admin roles)
      const users = await User.find({
        school: { $in: schoolIds },
        roles: { $nin: ['ICT_administrator', 'Admin'] },
      })
        .populate('school', 'name email')
        .select('-password')
        .sort({ createdAt: -1 })

      res.json({ users })
    } catch (error) {
      console.error('Error fetching managed users:', error)
      res.status(500).json({ message: 'Server error', error: error.message })
    }
  }
)

// Get current user details
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('school')
      .populate({
        path: 'school',
        populate: {
          path: 'groupSchool',
          model: 'GroupSchool',
        },
      })
      .select('-password')

    res.json({ user })
  } catch (error) {
    console.error('Error fetching current user:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// Create a new user (ICT Admin can create users in schools under their group school)
router.post(
  '/',
  authenticate,
  authorize(['ICT_administrator']),
  async (req, res) => {
    try {
      const ictAdmin = await User.findById(req.user.id).populate('school')

      if (!ictAdmin.school || !ictAdmin.school.groupSchool) {
        return res.status(400).json({
          message: 'ICT Admin not associated with a group school',
        })
      }

      const {
        firstname,
        lastname,
        email,
        phone,
        roles,
        type,
        gender,
        regNo,
        school: schoolId,
      } = req.body

      // Validate required fields
      if (
        !firstname ||
        !lastname ||
        !email ||
        !phone ||
        !roles ||
        !gender ||
        !regNo ||
        !schoolId
      ) {
        return res.status(400).json({
          message: 'All required fields must be provided',
        })
      }

      // Verify the school belongs to the same group school
      const targetSchool = await School.findOne({
        _id: schoolId,
        groupSchool: ictAdmin.school.groupSchool,
      })

      if (!targetSchool) {
        return res.status(403).json({
          message: 'Not authorized to create users in this school',
        })
      }

      // Restrict roles that ICT Admin can assign
      const allowedRoles = [
        'Principal',
        'Bursar',
        'Teacher',
        'Student',
        'Parent',
      ]
      const requestedRole = Array.isArray(roles) ? roles[0] : roles

      if (!allowedRoles.includes(requestedRole)) {
        return res.status(403).json({
          message: 'Not authorized to assign this role',
        })
      }

      // Check if user with email already exists
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(400).json({
          message: 'User with this email already exists',
        })
      }

      // Check if user with registration number already exists in the same school
      const existingRegNo = await User.findOne({ regNo, school: schoolId })
      if (existingRegNo) {
        return res.status(400).json({
          message:
            'User with this registration number already exists in this school',
        })
      }

      // Generate default password
      const defaultPassword = 'password123'
      const hashedPassword = await bcrypt.hash(defaultPassword, 10)

      // Create new user
      const newUser = new User({
        firstname,
        lastname,
        email,
        phone,
        password: hashedPassword,
        roles: Array.isArray(roles) ? roles : [roles],
        type: type || 'day',
        gender,
        regNo,
        school: schoolId,
        status: 'active',
        isActive: true,
      })

      await newUser.save()

      // Populate school information before returning
      await newUser.populate('school', 'name email')

      // Remove password from response
      const userResponse = newUser.toObject()
      delete userResponse.password

      res.status(201).json({
        message: 'User created successfully',
        user: userResponse,
        defaultPassword: defaultPassword,
      })
    } catch (error) {
      console.error('Error creating user:', error)
      res.status(500).json({ message: 'Server error', error: error.message })
    }
  }
)

// Update user status (activate/deactivate)
router.patch(
  '/:userId/status',
  authenticate,
  authorize(['ICT_administrator']),
  async (req, res) => {
    try {
      const ictAdmin = await User.findById(req.user.id).populate('school')

      if (!ictAdmin.school || !ictAdmin.school.groupSchool) {
        return res.status(400).json({
          message: 'ICT Admin not associated with a group school',
        })
      }

      const { userId } = req.params
      const { isActive } = req.body

      // Find the user and verify they belong to a school under the same group school
      const user = await User.findById(userId).populate('school')

      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }

      // Check if user's school belongs to the same group school
      if (
        !user.school ||
        user.school.groupSchool.toString() !==
          ictAdmin.school.groupSchool.toString()
      ) {
        return res.status(403).json({
          message: 'Not authorized to modify this user',
        })
      }

      // Prevent modifying ICT Admin or Admin users
      if (
        user.roles.includes('ICT_administrator') ||
        user.roles.includes('Admin')
      ) {
        return res.status(403).json({
          message: 'Not authorized to modify this user type',
        })
      }

      // Update user status
      user.isActive = isActive
      user.status = isActive ? 'active' : 'inactive'
      await user.save()

      res.json({
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        user: {
          _id: user._id,
          isActive: user.isActive,
          status: user.status,
        },
      })
    } catch (error) {
      console.error('Error updating user status:', error)
      res.status(500).json({ message: 'Server error', error: error.message })
    }
  }
)

// Update user information
router.patch(
  '/:userId',
  authenticate,
  authorize(['ICT_administrator']),
  async (req, res) => {
    try {
      const ictAdmin = await User.findById(req.user.id).populate('school')

      if (!ictAdmin.school || !ictAdmin.school.groupSchool) {
        return res.status(400).json({
          message: 'ICT Admin not associated with a group school',
        })
      }

      const { userId } = req.params
      const updateData = req.body

      // Remove sensitive fields that shouldn't be updated
      delete updateData.password
      delete updateData._id
      delete updateData.__v

      // Find the user and verify they belong to a school under the same group school
      const user = await User.findById(userId).populate('school')

      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }

      // Check if user's school belongs to the same group school
      if (
        !user.school ||
        user.school.groupSchool.toString() !==
          ictAdmin.school.groupSchool.toString()
      ) {
        return res.status(403).json({
          message: 'Not authorized to modify this user',
        })
      }

      // Prevent modifying ICT Admin or Admin users
      if (
        user.roles.includes('ICT_administrator') ||
        user.roles.includes('Admin')
      ) {
        return res.status(403).json({
          message: 'Not authorized to modify this user type',
        })
      }

      // If updating school, verify the new school belongs to the same group school
      if (updateData.school) {
        const targetSchool = await School.findOne({
          _id: updateData.school,
          groupSchool: ictAdmin.school.groupSchool,
        })

        if (!targetSchool) {
          return res.status(403).json({
            message: 'Not authorized to assign user to this school',
          })
        }
      }

      // If updating roles, restrict allowed roles
      if (updateData.roles) {
        const allowedRoles = [
          'Principal',
          'Bursar',
          'Teacher',
          'Student',
          'Parent',
        ]
        const requestedRole = Array.isArray(updateData.roles)
          ? updateData.roles[0]
          : updateData.roles

        if (!allowedRoles.includes(requestedRole)) {
          return res.status(403).json({
            message: 'Not authorized to assign this role',
          })
        }
      }

      // Check for email conflicts if email is being updated
      if (updateData.email && updateData.email !== user.email) {
        const existingUser = await User.findOne({ email: updateData.email })
        if (existingUser) {
          return res.status(400).json({
            message: 'User with this email already exists',
          })
        }
      }

      // Check for registration number conflicts if regNo is being updated
      if (updateData.regNo && updateData.regNo !== user.regNo) {
        const existingRegNo = await User.findOne({
          regNo: updateData.regNo,
          school: updateData.school || user.school,
        })
        if (existingRegNo) {
          return res.status(400).json({
            message:
              'User with this registration number already exists in this school',
          })
        }
      }

      // Update the user
      Object.keys(updateData).forEach((key) => {
        user[key] = updateData[key]
      })

      await user.save()
      await user.populate('school', 'name email')

      // Remove password from response
      const userResponse = user.toObject()
      delete userResponse.password

      res.json({
        message: 'User updated successfully',
        user: userResponse,
      })
    } catch (error) {
      console.error('Error updating user:', error)
      res.status(500).json({ message: 'Server error', error: error.message })
    }
  }
)

// Reset user password
router.post(
  '/:userId/reset-password',
  authenticate,
  authorize(['ICT_administrator']),
  async (req, res) => {
    try {
      const ictAdmin = await User.findById(req.user.id).populate('school')

      if (!ictAdmin.school || !ictAdmin.school.groupSchool) {
        return res.status(400).json({
          message: 'ICT Admin not associated with a group school',
        })
      }

      const { userId } = req.params

      // Find the user and verify they belong to a school under the same group school
      const user = await User.findById(userId).populate('school')

      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }

      // Check if user's school belongs to the same group school
      if (
        !user.school ||
        user.school.groupSchool.toString() !==
          ictAdmin.school.groupSchool.toString()
      ) {
        return res.status(403).json({
          message: 'Not authorized to reset password for this user',
        })
      }

      // Prevent resetting password for ICT Admin or Admin users
      if (
        user.roles.includes('ICT_administrator') ||
        user.roles.includes('Admin')
      ) {
        return res.status(403).json({
          message: 'Not authorized to reset password for this user type',
        })
      }

      // Generate new default password
      const newPassword = 'password123'
      const hashedPassword = await bcrypt.hash(newPassword, 10)

      // Update user password
      user.password = hashedPassword
      await user.save()

      res.json({
        message: 'Password reset successfully',
        newPassword: newPassword,
      })
    } catch (error) {
      console.error('Error resetting password:', error)
      res.status(500).json({ message: 'Server error', error: error.message })
    }
  }
)

module.exports = router
