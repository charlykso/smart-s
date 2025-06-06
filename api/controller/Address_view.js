const Address = require('../model/Address')

exports.getAllAddresses = async (req, res) => {
  try {
    const addresses = await Address.find()
    res.status(200).json(addresses)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getAddressById = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id)
    if (!address) return res.status(404).json({ message: 'Address not found' })
    res.status(200).json(address)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.createAddress = async (req, res) => {
  const address = new Address({
    country: req.body.country,
    state: req.body.state,
    town: req.body.town,
    street: req.body.street,
    zip_code: req.body.zip_code,
    street_no: req.body.street_no,
  })
  try {
    const newAddress = await address.save()
    res.status(201).json(newAddress)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

exports.updateAddress = async (req, res) => {
  try {
    const address = await Address.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
    if (!address) return res.status(404).json({ message: 'Address not found' })
    address.country = req.body.country
    address.state = req.body.state
    address.town = req.body.town
    address.street = req.body.street
    address.zip_code = req.body.zip_code
    address.street_no = req.body.street_no
    const updatedAddress = await address.save()
    res.status(200).json(updatedAddress)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.deleteAddress = async (req, res) => {
  try {
    const address = await Address.findByIdAndDelete(req.params.id)
    if (!address) return res.status(404).json({ message: 'Address not found' })
    res.status(200).json({ message: 'Address deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
