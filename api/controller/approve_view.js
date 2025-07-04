const Fee = require('../model/Fee')

// controllers/feeController.js
exports.approveFee = async (req, res) => {
  try {
    const { fee_id } = req.params

    const fee = await Fee.findById(fee_id)
    if (!fee) {
      return res.status(404).json({ message: 'Fee not found' })
    }

    // Set the fee as approved
    fee.isApproved = true

    await fee.save()

    res.status(200).json({
      success: true,
      message: 'Fee approval status updated successfully',
      data: fee,
    })
  } catch (error) {
    console.error('Approve fee error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    })
  }
}
