const express = require('express')
const router = express.Router()
const School = require('../model/School')
const User = require('../model/User')
const bcrypt = require('bcryptjs')
const { authenticate, authorize } = require('../middleware/auth')

// Get schools under the same group school (for ICT Admin)
router.get(
  '/by-group',
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
      }).populate('groupSchool')

      // Get user count for each school
      const schoolsWithUserCount = await Promise.all(
        schools.map(async (school) => {
          const userCount = await User.countDocuments({ school: school._id })
          return {
            ...school.toObject(),
            userCount,
          }
        })
      )

      res.json({ schools: schoolsWithUserCount })
    } catch (error) {
      console.error('Error fetching schools by group:', error)
      res.status(500).json({ message: 'Server error', error: error.message })
    }
  }
)

// Create a new school under the same group school
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

      const { name, email, phoneNumber, address, isActive = true } = req.body

      // Validate required fields
      if (!name || !email || !phoneNumber) {
        return res.status(400).json({
          message: 'Name, email, and phone number are required',
        })
      }

      // Check if school with same email already exists
      const existingSchool = await School.findOne({ email })
      if (existingSchool) {
        return res.status(400).json({
          message: 'School with this email already exists',
        })
      }

      // Check if school with same phone number already exists
      const existingPhone = await School.findOne({ phoneNumber })
      if (existingPhone) {
        return res.status(400).json({
          message: 'School with this phone number already exists',
        })
      }

      const school = new School({
        groupSchool: ictAdmin.school.groupSchool,
        name,
        email,
        phoneNumber,
        address,
        isActive,
      })

      await school.save()
      await school.populate('groupSchool')

      res.status(201).json({
        message: 'School created successfully',
        school,
      })
    } catch (error) {
      console.error('Error creating school:', error)
      res.status(500).json({ message: 'Server error', error: error.message })
    }
  }
)

// Update a school
router.patch(
  '/:schoolId',
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

      const { schoolId } = req.params
      const updateData = req.body

      // Find the school and verify it belongs to the same group school
      const school = await School.findOne({
        _id: schoolId,
        groupSchool: ictAdmin.school.groupSchool,
      })

      if (!school) {
        return res.status(404).json({
          message: 'School not found or not authorized to modify',
        })
      }

      // Check for email conflicts if email is being updated
      if (updateData.email && updateData.email !== school.email) {
        const existingSchool = await School.findOne({ email: updateData.email })
        if (existingSchool) {
          return res.status(400).json({
            message: 'School with this email already exists',
          })
        }
      }

      // Check for phone conflicts if phone is being updated
      if (
        updateData.phoneNumber &&
        updateData.phoneNumber !== school.phoneNumber
      ) {
        const existingPhone = await School.findOne({
          phoneNumber: updateData.phoneNumber,
        })
        if (existingPhone) {
          return res.status(400).json({
            message: 'School with this phone number already exists',
          })
        }
      }

      // Update the school
      Object.keys(updateData).forEach((key) => {
        if (key !== 'groupSchool') {
          // Prevent changing group school
          school[key] = updateData[key]
        }
      })

      await school.save()
      await school.populate('groupSchool')

      res.json({
        message: 'School updated successfully',
        school,
      })
    } catch (error) {
      console.error('Error updating school:', error)
      res.status(500).json({ message: 'Server error', error: error.message })
    }
  }
)

// Delete a school (only if it has no users)
router.delete(
  '/:schoolId',
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

      const { schoolId } = req.params

      // Find the school and verify it belongs to the same group school
      const school = await School.findOne({
        _id: schoolId,
        groupSchool: ictAdmin.school.groupSchool,
      })

      if (!school) {
        return res.status(404).json({
          message: 'School not found or not authorized to delete',
        })
      }

      // Check if school has any users
      const userCount = await User.countDocuments({ school: schoolId })
      if (userCount > 0) {
        return res.status(400).json({
          message: `Cannot delete school. It has ${userCount} users. Please transfer or remove all users first.`,
        })
      }

      await School.findByIdAndDelete(schoolId)

      res.json({
        message: 'School deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting school:', error)
      res.status(500).json({ message: 'Server error', error: error.message })
    }
  }
)

module.exports = router
