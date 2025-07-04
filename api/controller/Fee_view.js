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
      .populate({
        path: 'term',
        select: 'name',
        populate: {
          path: 'session',
          select: 'name',
        },
      })
      .populate('school', 'name')
    res.status(200).json(fees)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getFee = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id).populate({
      path: 'term',
      select: 'name',
      populate: {
        path: 'session',
        select: 'name',
      },
    })
    if (!fee) return res.status(404).json({ message: 'Fee not found' })
    res.status(200).json(fee)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.createFee = async (req, res) => {
  const fee = new Fee({
    term: req.body.term_id,
    school: req.body.school_id,
    name: req.body.name,
    decription: req.body.decription,
    type: req.body.type,
    isActive: req.body.isActive,
    isInstallmentAllowed: req.body.isInstallmentAllowed,
    no_ofInstallments: req.body.no_ofInstallments,
    amount: req.body.amount,
    isApproved: req.body.isApproved,
  })
  try {
    // Check for duplicate: same name AND same term (not OR)
    const existing = await Fee.findOne({
      name: req.body.name,
      term: req.body.term_id,
      school: req.body.school_id,
    })
    if (existing)
      return res.status(409).json({
        message: 'A fee with this name already exists for this term and school',
      })
    const school = await School.findById(req.body.school_id)
    if (!school) return res.status(409).json({ message: 'School not found' })
    const term = await Term.findById(req.body.term_id)
    if (!term) return res.status(409).json({ message: 'Term not found' })
    const newFee = await fee.save()
    res.status(201).json({
      success: true,
      data: newFee,
      message: 'Fee created successfully',
    })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

exports.updateFee = async (req, res) => {
  try {
    const fee = await Fee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate('term')
    if (!fee) return res.status(404).json({ message: 'Fee not found' })
    fee.term = req.body.term_id
    fee.school = req.body.school_id
    fee.name = req.body.name
    fee.decription = req.body.decription
    fee.type = req.body.type
    fee.isActive = req.body.isActive
    fee.isInstallmentAllowed = req.body.isInstallmentAllowed
    fee.no_ofInstallments = req.body.no_ofInstallments
    fee.amount = req.body.amount
    fee.isApproved = req.body.isApproved
    const updatedFee = await fee.save()
    res.status(200).json(updatedFee)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

exports.deleteFee = async (req, res) => {
  try {
    const fee = await Fee.findByIdAndDelete(req.params.id)
    if (!fee) return res.status(404).json({ message: 'Fee not found' })
    res.json({ message: 'Fee Deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
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
      .populate({
        path: 'term',
        select: 'name',
        populate: {
          path: 'session',
          select: 'name',
        },
      })
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
      .populate({
        path: 'term',
        select: 'name',
        populate: {
          path: 'session',
          select: 'name',
        },
      })
      .populate('school', 'name')
    res.status(200).json(fees)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getApprovedFeesByTerm = async (req, res) => {
  try {
    const { term_id } = req.params
    const fees = await Fee.find({ term: term_id, isApproved: true }).populate({
      path: 'term',
      select: 'name',
      populate: {
        path: 'session',
        select: 'name',
      },
    })
    res.status(200).json(fees)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getUnapprovedFeesByTerm = async (req, res) => {
  try {
    const { term_id } = req.params
    const fees = await Fee.find({ term: term_id, isApproved: false }).populate({
      path: 'term',
      select: 'name',
      populate: {
        path: 'session',
        select: 'name',
      },
    })
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
