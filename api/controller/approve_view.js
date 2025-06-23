const Fee = require('../model/Fee')

// controllers/feeController.js
exports.approveFee = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.fee_id).populate('school')
    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee not found',
      })
    }

    // Ensure principal can only approve fees for their school
    const userRoles = req.user.roles || []
    if (userRoles.includes('Principal') && !userRoles.includes('Admin')) {
      const userSchool = req.user.school?._id || req.user.school
      const feeSchool = fee.school._id || fee.school

      if (!userSchool) {
        return res.status(403).json({
          success: false,
          message: 'Principal must be assigned to a school to approve fees',
        })
      }

      if (userSchool.toString() !== feeSchool.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Principal can only approve fees for their own school',
        })
      }
    }

    // Update approval status
    fee.isApproved = true
    await fee.save()

    res.status(200).json({
      success: true,
      message: 'Fee approved successfully',
      data: fee,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.rejectFee = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.fee_id).populate('school')
    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee not found',
      })
    }

    // Ensure principal can only reject fees for their school
    const userRoles = req.user.roles || []
    if (userRoles.includes('Principal') && !userRoles.includes('Admin')) {
      const userSchool = req.user.school?._id || req.user.school
      const feeSchool = fee.school._id || fee.school

      if (!userSchool) {
        return res.status(403).json({
          success: false,
          message: 'Principal must be assigned to a school to reject fees',
        })
      }

      if (userSchool.toString() !== feeSchool.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Principal can only reject fees for their own school',
        })
      }
    }

    // Update approval status to false
    fee.isApproved = false
    await fee.save()

    res.status(200).json({
      success: true,
      message: 'Fee rejected successfully',
      data: fee,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
