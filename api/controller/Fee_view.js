const Fee = require('../model/Fee')
const Term = require('../model/Term')
const School = require('../model/School')

exports.getFees = async (req, res) => {
  try {
    // Apply school filtering if user is not Admin
    let query = {}
    if (req.schoolFilter) {
      query = req.schoolFilter
    }

    const fees = await Fee.find(query)
      .populate('term', 'name')
      .populate('school', 'name')
    res.status(200).json(fees)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getFee = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id).populate('term', 'name')
    if (!fee) return res.status(404).json({ message: 'Fee not found' })
    res.status(200).json(fee)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.createFee = async (req, res) => {
  try {
    // Ensure bursar can only create fees for their school
    let schoolId = req.body.school_id
    const userRoles = req.user.roles || []

    // If user is Bursar, enforce their school
    if (userRoles.includes('Bursar') && !userRoles.includes('Admin')) {
      if (!req.user.school) {
        return res.status(403).json({
          success: false,
          message: 'Bursar must be assigned to a school to create fees',
        })
      }
      schoolId = req.user.school._id || req.user.school
    }

    // Validate school exists
    const school = await School.findById(schoolId)
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found',
      })
    }

    // Validate term exists
    const term = await Term.findById(req.body.term_id)
    if (!term) {
      return res.status(404).json({
        success: false,
        message: 'Term not found',
      })
    }

    // Check for existing fee with same name and term
    const existing = await Fee.findOne({
      name: req.body.name,
      term: req.body.term_id,
      school: schoolId,
    })

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A fee with this name already exists for this term and school',
      })
    }

    // Create fee - bursars cannot set approval status
    const fee = new Fee({
      term: req.body.term_id,
      school: schoolId,
      name: req.body.name,
      decription: req.body.decription,
      type: req.body.type,
      isActive: req.body.isActive || true,
      isInstallmentAllowed: req.body.isInstallmentAllowed || false,
      no_ofInstallments: req.body.no_ofInstallments || 1,
      amount: req.body.amount,
      isApproved: false, // Always false for new fees - principal must approve
    })

    const newFee = await fee.save()

    res.status(201).json({
      success: true,
      message: 'Fee created successfully. Awaiting principal approval.',
      data: newFee,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}

exports.updateFee = async (req, res) => {
  try {
    // Find the existing fee first
    const existingFee = await Fee.findById(req.params.id).populate('school')
    if (!existingFee) {
      return res.status(404).json({
        success: false,
        message: 'Fee not found',
      })
    }

    // Ensure bursar can only update fees for their school
    const userRoles = req.user.roles || []
    if (userRoles.includes('Bursar') && !userRoles.includes('Admin')) {
      const userSchool = req.user.school?._id || req.user.school
      const feeSchool = existingFee.school._id || existingFee.school

      if (!userSchool) {
        return res.status(403).json({
          success: false,
          message: 'Bursar must be assigned to a school to update fees',
        })
      }

      if (userSchool.toString() !== feeSchool.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Bursar can only update fees for their own school',
        })
      }
    }

    // Validate term if provided
    if (req.body.term_id) {
      const term = await Term.findById(req.body.term_id)
      if (!term) {
        return res.status(404).json({
          success: false,
          message: 'Term not found',
        })
      }
    }

    // Update fee properties - bursars cannot change approval status or school
    const updateData = {
      term: req.body.term_id || existingFee.term,
      name: req.body.name || existingFee.name,
      decription: req.body.decription || existingFee.decription,
      type: req.body.type || existingFee.type,
      isActive:
        req.body.isActive !== undefined
          ? req.body.isActive
          : existingFee.isActive,
      isInstallmentAllowed:
        req.body.isInstallmentAllowed !== undefined
          ? req.body.isInstallmentAllowed
          : existingFee.isInstallmentAllowed,
      no_ofInstallments:
        req.body.no_ofInstallments || existingFee.no_ofInstallments,
      amount: req.body.amount || existingFee.amount,
    }

    // Only Admin can change school and approval status
    if (userRoles.includes('Admin')) {
      if (req.body.school_id) updateData.school = req.body.school_id
      if (req.body.isApproved !== undefined)
        updateData.isApproved = req.body.isApproved
    }

    const updatedFee = await Fee.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    })
      .populate('term')
      .populate('school')

    res.status(200).json({
      success: true,
      message: 'Fee updated successfully',
      data: updatedFee,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}

exports.deleteFee = async (req, res) => {
  try {
    // Find the fee first to check school ownership
    const existingFee = await Fee.findById(req.params.id).populate('school')
    if (!existingFee) {
      return res.status(404).json({
        success: false,
        message: 'Fee not found',
      })
    }

    // Ensure bursar can only delete fees for their school
    const userRoles = req.user.roles || []
    if (userRoles.includes('Bursar') && !userRoles.includes('Admin')) {
      const userSchool = req.user.school?._id || req.user.school
      const feeSchool = existingFee.school._id || existingFee.school

      if (!userSchool) {
        return res.status(403).json({
          success: false,
          message: 'Bursar must be assigned to a school to delete fees',
        })
      }

      if (userSchool.toString() !== feeSchool.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Bursar can only delete fees for their own school',
        })
      }
    }

    // Check if fee has associated payments before deletion
    const Payment = require('../model/Payment')
    const hasPayments = await Payment.findOne({ fee: req.params.id })

    if (hasPayments) {
      return res.status(400).json({
        success: false,
        message:
          'Cannot delete fee with existing payments. Consider deactivating instead.',
      })
    }

    await Fee.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: 'Fee deleted successfully',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.getFeesByTerm = async (req, res) => {
  try {
    const { term_id } = req.params
    const fees = await Fee.find({ term: term_id }).populate('term', 'name')
    res.json(fees)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getApprovedFees = async (req, res) => {
  try {
    // Build query with school filtering
    let query = { isApproved: true }
    if (req.schoolFilter) {
      query = { ...query, ...req.schoolFilter }
    }

    const fees = await Fee.find(query)
      .populate('term', 'name')
      .populate('school', 'name')
    res.status(200).json(fees)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getUnapprovedFees = async (req, res) => {
  try {
    // Build query with school filtering
    let query = { isApproved: false }
    if (req.schoolFilter) {
      query = { ...query, ...req.schoolFilter }
    }

    const fees = await Fee.find(query)
      .populate('term', 'name')
      .populate('school', 'name')
    res.status(200).json(fees)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getApprovedFeesByTerm = async (req, res) => {
  try {
    const { term_id } = req.params
    const fees = await Fee.find({ term: term_id, isApproved: true }).populate(
      'term',
      'name'
    )
    res.status(200).json(fees)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getUnapprovedFeesByTerm = async (req, res) => {
  try {
    const { term_id } = req.params
    const fees = await Fee.find({ term: term_id, isApproved: false }).populate(
      'term',
      'name'
    )
    res.status(200).json(fees)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.approvedFeesForASchool = async (req, res) => {
  try {
    const { school_id } = req.params
    const fees = await Fee.find({
      school: school_id,
      isApproved: true,
    })
      .populate({
        path: 'school',
        select: 'name',
      })
      .populate({
        path: 'term',
        select: 'name',
        populate: {
          path: 'session',
          select: 'school name',
        },
      })
    res.status(200).json(fees)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.unapprovedFeesForASchool = async (req, res) => {
  try {
    const { school_id } = req.params
    const fees = await Fee.find({
      school: school_id,
      isApproved: false,
    })
      .populate({
        path: 'school',
        select: 'name',
      })
      .populate({
        path: 'term',
        select: 'name',
        populate: {
          path: 'session',
          select: 'school name',
        },
      })
    res.status(200).json(fees)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getFeesBySchool = async (req, res) => {
  try {
    const { school_id } = req.params
    const fees = await Fee.find({ school: school_id })
      .populate('term', 'name')
      .populate('school', 'name')
    res.status(200).json(fees)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get approved fees for students from their school only
exports.getApprovedFeesForStudent = async (req, res) => {
  try {
    // Use the studentSchoolFilter set by enforceSchoolBoundary middleware
    let query = req.studentSchoolFilter || { isApproved: true }

    const fees = await Fee.find(query)
      .populate({
        path: 'term',
        select: 'name',
        populate: {
          path: 'session',
          select: 'name',
        },
      })
      .populate('school', 'name')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      data: fees,
      message: 'Approved fees retrieved successfully',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
