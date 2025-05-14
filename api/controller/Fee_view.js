const Fee = require('../model/Fee');
const Term = require('../model/Term');

exports.getFees = async (req, res) => {
    try {
        const fees = await Fee.find().populate('term', 'name');
        res.status(200).json(fees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getFee = async (req, res) => {
    try {
        const fee = await Fee.findById(req.params.id).populate('term', 'name');
        if (!fee) return res.status(404).json({ message: 'Fee not found' });
        res.status(200).json(fee);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.createFee = async (req, res) => {
    const fee = new Fee({
        term: req.body.term_id,
        name: req.body.name,
        decription: req.body.decription,
        type: req.body.type,
        isActive: req.body.isActive,
        isInstallmentAllowed: req.body.isInstallmentAllowed,
        no_ofInstallments: req.body.no_ofInstallments,
        amount: req.body.amount,
        isApproved: req.body.isApproved,
    });
    try {
        const existing = await Fee.findOne({ $or: [{ name: req.body.name, term: req.body.term_id }] })
        if (existing) return res.status(409).json({ message: 'This Fee already exist' });
        const term = await Term.findById(req.body.term_id)
        if (!term) return res.status(409).json({message: "Term not found"})
        const newFee = await fee.save();
        res.status(201).json(newFee);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

exports.updateFee = async (req, res) => {
    try {
        const fee = await Fee.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('term');
        if (!fee) return res.status(404).json({ message: 'Fee not found' });
        fee.term = req.body.term_id;
        fee.name = req.body.name;
        fee.decription = req.body.decription;
        fee.type = req.body.type;
        fee.isActive = req.body.isActive;
        fee.isInstallmentAllowed = req.body.isInstallmentAllowed;
        fee.no_ofInstallments = req.body.no_ofInstallments;
        fee.amount = req.body.amount;
        fee.isApproved = req.body.isApproved;
        const updatedFee = await fee.save();
        res.status(200).json(updatedFee);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}

exports.deleteFee = async (req, res) =>{
    try{
        const fee = await Fee.findByIdAndDelete(req.params.id)
        if (!fee) return res.status(404).json({message: "Fee not found"})
        res.json({message:'Fee Deleted'})
    }catch (error){
        res.status(500).json({message: error.message})
    }
}

exports.getFeesByTerm = async (req, res) =>{
    try{
        const {term_id} = req.params
        const fees = await Fee.findById({term: term_id}).populate('term', 'name')
        res.json(fees)
    }catch(error){
        res.status(500).json({message: error.message})
    }
}

exports.getApprovedFees = async (req, res) => {
    try {
        const fees = await Fee.find({ isApproved: true }).populate('term', 'name');
        res.status(200).json(fees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getUnapprovedFees = async (req, res) => {
    try {
        const fees = await Fee.find({ isApproved: false }).populate('term', 'name');
        res.status(200).json(fees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getApprovedFeesByTerm = async (req, res) => {
    try {
        const { term_id } = req.params;
        const fees = await Fee.find({ term: term_id, isApproved: true }).populate('term', 'name');
        res.status(200).json(fees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getUnapprovedFeesByTerm = async (req, res) => {
    try {
        const { term_id } = req.params;
        const fees = await Fee.find({ term: term_id, isApproved: false }).populate('term', 'name');
        res.status(200).json(fees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}