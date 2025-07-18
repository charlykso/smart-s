const PaymentProfile = require('../model/PaymentProfile')

exports.getAllPaymentProfiles = async (req, res) => {
  try {
    const profiles = await PaymentProfile.find().populate('school')
    res.status(200).json({
      success: true,
      message: 'Payment profiles retrieved successfully',
      data: profiles,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    })
  }
}

exports.getPaymentProfile = async (req, res) => {
  try {
    const profile = await PaymentProfile.findById(req.params.id).populate(
      'school'
    )
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      })
    }
    res.status(200).json({
      success: true,
      message: 'Payment profile retrieved successfully',
      data: profile,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    })
  }
}

exports.getAllPaymentProfilesForSchool = async (req, res) => {
  try {
    const { school_id } = req.params
    const profiles = await PaymentProfile.find({ school: school_id })
    res.status(200).json({
      success: true,
      message: 'Payment profiles retrieved successfully',
      data: profiles,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    })
  }
}

exports.createPaymentProfile = async (req, res) => {
  try {
    const {
      school_id,
      fw_secret_key,
      fw_public_key,
      ps_secret_key,
      ps_public_key,
      account_no,
      account_name,
      bank_name,
    } = req.body
    const existingProfile = await PaymentProfile.findOne({
      school: school_id,
      fw_secret_key,
      ps_secret_key,
    })
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'Profile for this school already exists.',
      })
    }
    const newProfile = await PaymentProfile.create({
      school: school_id,
      fw_secret_key,
      activate_fw: !!req.body.fw_secret_key,
      fw_public_key,
      account_no,
      account_name,
      bank_name,
      ps_secret_key,
      ps_public_key,
      activate_ps: !!req.body.ps_secret_key,
    })
    res.status(201).json({
      success: true,
      message: 'Payment profile created successfully',
      data: newProfile,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    })
  }
}

exports.updatePaymentProfile = async (req, res) => {
  try {
    const { id } = req.params
    const profile = await PaymentProfile.findById(id)
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      })
    }

    const {
      school_id,
      fw_secret_key,
      fw_public_key,
      activate_fw,
      ps_secret_key,
      ps_public_key,
      activate_ps,
      account_no,
      account_name,
      bank_name,
    } = req.body

    // Update fields if provided
    if (school_id !== undefined) profile.school = school_id
    if (fw_secret_key !== undefined) profile.fw_secret_key = fw_secret_key
    if (fw_public_key !== undefined) profile.fw_public_key = fw_public_key
    if (activate_fw !== undefined) profile.activate_fw = activate_fw
    if (ps_secret_key !== undefined) profile.ps_secret_key = ps_secret_key
    if (ps_public_key !== undefined) profile.ps_public_key = ps_public_key
    if (activate_ps !== undefined) profile.activate_ps = activate_ps
    if (account_no !== undefined) profile.account_no = account_no
    if (account_name !== undefined) profile.account_name = account_name
    if (bank_name !== undefined) profile.bank_name = bank_name

    await profile.save()
    res.status(200).json({
      success: true,
      message: 'Payment profile updated successfully',
      data: profile,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    })
  }
}
exports.deletePaymentProfile = async (req, res) => {
  try {
    const profile = await PaymentProfile.findById(req.params.id)
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      })
    }
    await PaymentProfile.findByIdAndDelete(req.params.id)
    res.status(200).json({
      success: true,
      message: 'Payment profile deleted successfully',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    })
  }
}
