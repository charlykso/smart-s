const Fee = require('../model/Fee');

// controllers/feeController.js
exports.approveFee = async (req, res) => {
  try {
    const { isApproved, fee_id } = req.body;

    const fee = await Fee.findById(req.params.fee_id);
    if (!fee) {
      return res.status(404).json({ message: "Fee not found" });
    }

   
    fee.isApproved = true; // Set isActive to true if approved

    



    await fee.save();

    res.status(200).json({ message: "Fee approval status updated successfully", fee });
  }catch (error) {
    res.status(500).json({ message: error.message });
  }
};