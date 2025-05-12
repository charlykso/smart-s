const Term = require('../model/Term');
const Session = require('../model/Session');
const School = require('../model/School');


exports.getAllTerms = async (req, res) => {
    try {
        const terms = await Term.find();
        res.status(200).json(terms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getTermById = async (req, res) => {
    try {
        const term = await Term.findById(req.params.id);
        if (!term) return res.status(404).json({ message: "Term not found" });
        res.status(200).json(term);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTermsBySessionAndSchool = async (req, res) => {
    try {
        const { school_id, session_id } = req.params;

        const school = await School.findById(school_id);
        if (!school) return res.status(404).json({ message: "School not found" });

        const session = await Session.findById(session_id);
        if (!session) return res.status(404).json({ message: "Session not found" });

        const terms = await Term.find({ session: session_id, school: school_id }).populate('session');

        res.status(200).json(terms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createTerm = async (req, res) => {
    try {
        const { session: session_id, name, startDate, endDate } = req.body;
        const session = await Session.findById(session_id)
        if (!session) return res.status(409).json({ message: 'term not found' })
        const existingTerm = await Term.findOne({ name })
        if (existingTerm) { return res.status(400).json({ message: "term already exists" }) };
        const term = new Term({ session: session_id, name, startDate, endDate });
        await term.save();
        res.status(201).json(term);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


exports.updateTerm = async (req, res) => {
    try {
        const { name, startDate, endDate } = req.body;
        const term = await Term.findByIdAndUpdate(
            req.params.id,
            { name, startDate, endDate },
            { new: true }
        );
        if (!term) return res.status(404).json({ message: "Term not found" });
        res.status(200).json(term);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.deleteTerm = async (req, res) => {
    try {
        const term = await Term.findByIdAndDelete(req.params.id);
        if (!term) return res.status(404).json({ message: "Term not found" });
        res.status(200).json({ message: "Term deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTermBySession = async (req, res) => {
    try {
        const { session } = req.params
        const term = await Term.find({ session: session }).populate('session')
        res.json(term)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
};

