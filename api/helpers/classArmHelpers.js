const ClassArm = require('../model/ClassArm')
const User = require('../model/User')

/**
 * Gets the current student count for a specific classArm
 * @param {string} classArmId - The ID of the classArm to get count for
 * @returns {Promise<Object>} - Result object with success status and data
 */
const updateClassArmStudentCount = async (classArmId) => {
  try {
    if (!classArmId) {
      return {
        success: false,
        error: 'ClassArm ID is required',
      }
    }

    // Count active students in the specific classArm
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

    console.log(
      `Current student count for classArm ${classArmId}: ${studentCount} students`
    )

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

/**
 * Updates student counts for multiple classArms
 * @param {Array<string>} classArmIds - Array of classArm IDs to update
 * @returns {Promise<Object>} - Result object with success status and summary
 */
const updateMultipleClassArmsStudentCount = async (classArmIds) => {
  try {
    const results = []

    for (const classArmId of classArmIds) {
      const result = await updateClassArmStudentCount(classArmId)
      results.push(result)
    }

    const successCount = results.filter((r) => r.success).length
    const failureCount = results.filter((r) => !r.success).length

    return {
      success: true,
      summary: {
        total: classArmIds.length,
        successful: successCount,
        failed: failureCount,
      },
      results,
    }
  } catch (error) {
    console.error('Error updating multiple classArms student counts:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Updates student counts for all classArms
 * @returns {Promise<Object>} - Result object with success status and summary
 */
const updateAllClassArmsStudentCount = async () => {
  try {
    // Get all classArm IDs
    const classArms = await ClassArm.find().select('_id')
    const classArmIds = classArms.map((ca) => ca._id.toString())

    return await updateMultipleClassArmsStudentCount(classArmIds)
  } catch (error) {
    console.error('Error updating all classArms student counts:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Middleware function to automatically update classArm student count
 * Call this after any operation that changes student-classArm relationships
 * @param {string|Array<string>} classArmIds - Single classArm ID or array of IDs
 * @param {Object} options - Options for the update
 * @param {boolean} options.silent - Whether to suppress console logs
 */
const autoUpdateClassArmStudentCount = async (classArmIds, options = {}) => {
  try {
    if (!classArmIds) return

    const { silent = false } = options

    // Convert single ID to array
    const idsArray = Array.isArray(classArmIds) ? classArmIds : [classArmIds]

    // Filter out null/undefined values
    const validIds = idsArray.filter((id) => id != null)

    if (validIds.length === 0) return

    if (!silent) {
      console.log(
        `Auto-updating student counts for ${validIds.length} classArm(s)`
      )
    }

    const result = await updateMultipleClassArmsStudentCount(validIds)

    if (!silent && result.success) {
      console.log(
        `Auto-update completed: ${result.summary.successful}/${result.summary.total} classArms updated successfully`
      )
    }

    return result
  } catch (error) {
    console.error('Error in auto-update classArm student count:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Gets the current student count for a classArm without updating the stored value
 * @param {string} classArmId - The ID of the classArm
 * @returns {Promise<Object>} - Result object with current count and classArm data
 */
const getClassArmCurrentStudentCount = async (classArmId) => {
  try {
    if (!classArmId) {
      return {
        success: false,
        error: 'ClassArm ID is required',
      }
    }

    // Get classArm details
    const classArm = await ClassArm.findById(classArmId).populate(
      'school',
      'name'
    )
    if (!classArm) {
      return {
        success: false,
        error: 'ClassArm not found',
      }
    }

    // Count current active students
    const currentStudentCount = await User.countDocuments({
      classArm: classArmId,
      roles: 'Student',
      status: 'active',
    })

    return {
      success: true,
      data: {
        classArm,
        currentStudentCount,
      },
    }
  } catch (error) {
    console.error(
      'Error getting classArm current student count:',
      classArmId,
      error
    )
    return {
      success: false,
      error: error.message,
    }
  }
}

module.exports = {
  updateClassArmStudentCount,
  updateMultipleClassArmsStudentCount,
  updateAllClassArmsStudentCount,
  autoUpdateClassArmStudentCount,
  getClassArmCurrentStudentCount,
}
