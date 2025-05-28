const Payment = require('../model/Payment');
const User = require('../model/User');

exports.getAllPaymentsByUser = async (req, res) => {
    try {
        const user_id = req.params.user_id;
        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({ error: 'User doesnt exist' });
        }
        const payments = await Payment.find({ user: user_id })
        .populate('user', 'email regNo')
        .populate('fee', 'name amount');
    
        if (!payments || payments.length === 0) {
        return res.status(404).json({ error: 'No payments found for this user' });
        }
    
        res.status(200).json(payments);
    } catch (error) {
        res
        .status(500)
        .json({ error: 'Internal server error', details: error.message });
    }
}