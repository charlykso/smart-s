const Session = require('../model/Session'); 
const School = require('../model/School');


exports.getAllSessions = async (req, res) => {
    try {
        const sessions = await Session.find();
        res.status(200).json(sessions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getSessionById = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);
        if (!session) return res.status(404).json({ message: "Session not found" });
        res.status(200).json(session);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.createSession = async (req, res) => {
    try {
        const {school: school_id, name, startDate, endDate} = req.body;
        const school = await School.findById(school_id)
        if(!school) return res.status(404).json({message: 'School not found'});
        const session = new Session({school: school_id, name, startDate, endDate });
        await session.save();
        res.status(201).json(session);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


exports.updateSession = async (req, res) => {
    try {
        const { school_id,name, startDate, endDate } = req.body;
        const session = await Session.findByIdAndUpdate(
            req.params.id,
            { school_id, name, startDate, endDate },
            { new: true }
        );
        if (!session) return res.status(404).json({ message: "Session not found" });
        res.status(200).json(session);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.deleteSession = async (req, res) => {
    try {
        const session = await Session.findByIdAndDelete(req.params.id);
        if (!session) return res.status(404).json({ message: "Session not found" });
        res.status(200).json({ message: "Session deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

