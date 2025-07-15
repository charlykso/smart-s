const ClassArm = require('../model/ClassArm')
const School = require('../model/School')
const User = require('../model/User')

exports.getAllClassArms = async (req, res) => {
  try {
    // Use school filter from middleware (req.schoolFilter) if user is restricted to a school
    // Only general Admin (not assigned to a school) can see all class arms
    const filter = req.schoolFilter || {}

    console.log('getAllClassArms debug:', {
      userEmail: req.user?.email,
      userRoles: req.user?.roles,
      schoolFilter: req.schoolFilter,
      filter,
    })

    const classArms = await ClassArm.find(filter).populate(
      'school',
      'name email phoneNumber'
    )

    console.log('ClassArms found:', classArms.length)
    console.log(
      'ClassArm schools:',
      classArms.map((c) => ({
        className: c.name,
        schoolName: c.school?.name,
        schoolId: c.school?._id,
      }))
    )

    res.status(200).json(classArms)
  } catch (error) {
    console.error('getAllClassArms error:', error)
    res.status(500).json({ message: error.message })
  }
}

exports.getClassArmById = async (req, res) => {
  try {
    const classArm = await ClassArm.findById(req.params.id).populate(
      'school',
      'name email phoneNumber'
    )
    if (!classArm)
      return res.status(404).json({ message: 'Class Arm not found' })
    res.status(200).json(classArm)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.createClassArm = async (req, res) => {
  try {
    const { school_id, name } = req.body
    const school = await School.findById(school_id)
    if (!school) return res.status(404).json({ message: 'School not found' })
    const classArm = new ClassArm({
      school: school_id,
      name,
    })
    await classArm.save()
    res.status(201).json(classArm)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

exports.updateClassArm = async (req, res) => {
  try {
    const classArm = await ClassArm.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
    if (!classArm)
      return res.status(404).json({ message: 'Class Arm not found' })
    res.status(200).json(classArm)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.deleteClassArm = async (req, res) => {
  try {
    const classArm = await ClassArm.findByIdAndDelete(req.params.id)
    if (!classArm)
      return res.status(404).json({ message: 'Class Arm not found' })
    res.status(200).json({ message: 'Class Arm deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Function to get the current student count for a classArm
exports.updateStudentCount = async (classArmId) => {
  try {
    // Count students in the specific classArm
    const studentCount = await User.countDocuments({
      classArm: classArmId,
      roles: 'Student',
      status: 'active',
    })

    // Get the classArm details
    const classArm = await ClassArm.findById(classArmId)

    if (!classArm) {
      return {
        success: false,
        error: 'ClassArm not found',
      }
    }

    return {
      success: true,
      classArmId,
      studentCount,
      classArm,
    }
  } catch (error) {
    console.error(
      'Error getting student count for classArm:',
      classArmId,
      error
    )
    return {
      success: false,
      error: error.message,
    }
  }
}

// API endpoint to manually update student count for a specific classArm
exports.updateClassArmStudentCount = async (req, res) => {
  try {
    const { id } = req.params

    // Check if classArm exists
    const classArm = await ClassArm.findById(id)
    if (!classArm) {
      return res.status(404).json({
        success: false,
        message: 'Class Arm not found',
      })
    }

    // Update student count
    const result = await exports.updateStudentCount(id)

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Student count retrieved successfully',
        data: {
          classArmId: result.classArmId,
          studentCount: result.studentCount,
          classArm: result.classArm,
        },
      })
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to get student count',
        error: result.error,
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Function to update student counts for all classArms
exports.updateAllClassArmsStudentCount = async (req, res) => {
  try {
    // Get all classArms
    const classArms = await ClassArm.find()
    const results = []

    // Update student count for each classArm
    for (const classArm of classArms) {
      const result = await exports.updateStudentCount(classArm._id)
      results.push(result)
    }

    const successCount = results.filter((r) => r.success).length
    const failureCount = results.filter((r) => !r.success).length

    res.status(200).json({
      success: true,
      message: `Updated student counts for ${successCount} classArms`,
      summary: {
        total: classArms.length,
        successful: successCount,
        failed: failureCount,
      },
      results: results,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Function to get classArm with current student count (without updating)
exports.getClassArmWithStudentCount = async (req, res) => {
  try {
    const { id } = req.params

    // Get classArm details
    const classArm = await ClassArm.findById(id).populate('school', 'name')
    if (!classArm) {
      return res.status(404).json({
        success: false,
        message: 'Class Arm not found',
      })
    }

    // Count current students
    const currentStudentCount = await User.countDocuments({
      classArm: id,
      roles: 'Student',
      status: 'active',
    })

    // Get list of students in this classArm
    const students = await User.find({
      classArm: id,
      roles: 'Student',
      status: 'active',
    }).select('firstname lastname regNo email phone')

    res.status(200).json({
      success: true,
      data: {
        classArm: {
          ...classArm.toObject(),
          currentStudentCount,
        },
        students,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
