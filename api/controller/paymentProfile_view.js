const PaymentProfile = require('../model/PaymentProfile')

exports.getAllPaymentProfiles = async (req, res) => {
  try {
    const profiles = await PaymentProfile.find().populate('school')
    res.status(200).json(profiles)
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Internal server error', details: error.message })
  }
}

exports.getPaymentProfile = async (req, res) => {
  try {
    const profile = await PaymentProfile.findById(req.body.id).populate('name')
    if (!profile) return res.status(404).json({ error: 'Profile not found' })
    res.status(200).json(profile)
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Internal server error', details: error.message })
  }
}

exports.getAllPaymentProfilesForSchool = async (req, res) => {
  try {
    const { school_id } = req.params.school_id
    const profiles = await PaymentProfile.find({ school: school_id })
    res.status(200).json(profiles)
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Internal server error', details: error.message })
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
      return res
        .status(400)
        .json({ error: 'Profile for this school already exists.' })
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
    res
      .status(201)
      .json({ message: 'Payment profile created', profile: newProfile })
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Internal server error', details: error.message })
  }
}

exports.updatePaymentProfile = async (req, res) => {
  try {
    const profile = await PaymentProfile.findById(req.body.id)
    if (!profile) return res.status(404).json({ error: 'Profile not found' })
    const { fw_secret_key, activate_fw, ps_secret_key, activate_ps } = req.body
    if (fw_secret_key !== undefined) profile.fw_secret_key = fw_secret_key
    if (activate_fw !== undefined) profile.activate_fw = activate_fw
    if (ps_secret_key !== undefined) profile.ps_secret_key = ps_secret_key
    if (activate_ps !== undefined) profile.activate_ps = activate_ps
    await profile.save()
    res.status(200).json({ message: 'Payment profile updated', profile })
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Internal server error', details: error.message })
  }
}
exports.deletePaymentProfile = async (req, res) => {
  try {
    const profile = await PaymentProfile.findById(req.body.id)
    if (!profile) return res.status(404).json({ error: 'Profile not found' })
    await PaymentProfile.findByIdAndDelete(req.body.id)
    res.status(200).json({ message: 'Payment profile deleted' })
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Internal server error', details: error.message })
  }
}
