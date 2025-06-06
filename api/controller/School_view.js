const School = require('../model/School')
const GroupSchool = require('../model/GroupSchool')
const Address = require('../model/Address')

exports.getSchools = async (req, res) => {
  try {
    const school = await School.find()
      .populate('address', 'country state zip_code town street street_no')
      .populate('groupSchool', 'name logo')
    res.status(200).json(school)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getSchool = async (req, res) => {
  try {
    const school = await School.findById(req.params.id)
      .populate('address', 'country state zip_code town street street_no')
      .populate('groupSchool', 'name logo')
    if (!school) return res.status(404).json({ message: 'School not found' })
    res.json(school)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.createSchool = async (req, res) => {
  try {
    const {
      groupSchool_id,
      name,
      email,
      phoneNumber,
      country,
      state,
      town,
      street,
      street_no,
      zip_code,
      address_id,
    } = req.body
    const groupSchool = await GroupSchool.findById(groupSchool_id)
    let schoolAddress_id = ''
    if (!groupSchool)
      return res.status(404).json({ message: 'GroupSchool not found' })
    if (!address_id) {
      const address = new Address({
        country,
        state,
        town,
        street,
        street_no,
        zip_code,
      })
      schoolAddress_id = await address.save()
      if (!schoolAddress_id)
        return res.status(404).json({ message: 'Address not found' })
      const school = new School({
        groupSchool: groupSchool_id,
        address: schoolAddress_id,
        name,
        email,
        phoneNumber,
      })
      await school.save()

      res.status(201).json({
        success: true,
        message: 'School created successfully',
        data: school,
      })
    } else {
      const address = await Address.findById(address_id)
      if (!address)
        return res.status(404).json({ message: 'Address not found' })
      schoolAddress_id = address._id
      const school = new School({
        groupSchool: groupSchool_id,
        address: schoolAddress_id,
        name,
        email,
        phoneNumber,
      })
      await school.save()

      res.status(201).json({
        success: true,
        message: 'School created successfully',
        data: school,
      })
    }
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

exports.updateSchool = async (req, res) => {
  try {
    const school = await School.findById(req.params.id)
    if (!school) return res.status(404).json({ message: 'School not found' })

    school.groupSchool = req.body.groupSchool_id
    school.address = req.body.address_id
    school.name = req.body.name
    school.email = req.body.email
    school.phoneNumber = req.body.phoneNumber

    const updatedSchool = await school.save()
    res.status(200).json({
      success: true,
      message: 'School updated successfully',
      data: updatedSchool,
    })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

exports.deleteSchool = async (req, res) => {
  try {
    const school = await School.findById(req.params.id)
    if (!school) return res.status(404).json({ message: 'School not found' })
    await School.findByIdAndDelete({ _id: req.params.id })
    res.status(200).json({
      success: true,
      message: 'School deleted successfully',
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getSchoolByAddress = async (req, res) => {
  try {
    const school = await School.find({
      address: req.params.address_id,
    }).populate('address', 'country state zip_code town street street_no')
    res.status(200).json(school)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getSchoolByGroupSchool = async (req, res) => {
  try {
    const schools = await School.find({
      groupSchool: req.params.groupSchool_id,
    })
      .populate('address', 'country state zip_code town street street_no')
      .populate('groupSchool', 'name logo')
    if (!schools) return res.status(404).json({ message: 'School not found' })
    res.status(200).json(schools)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
