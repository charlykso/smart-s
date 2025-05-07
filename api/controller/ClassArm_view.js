const ClassArm = require('../model/ClassArm'); 

exports.getAllClassArms = async (req, res) => {
    try {
        const classArms = await ClassArm.find();
        res.status(200).json(classArms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getClassArmById = async (req, res) => {
    try {
        const classArm = await ClassArm.findById(req.params.id);
        if (!classArm) return res.status(404).json({ message: "Class Arm not found" });
        res.status(200).json(classArm);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.createClassArm = async (req, res) => {
    try {
        const { school_id, name, totalNumberOfStudents } = req.body
        const school = await School.findById(school_id);
        if (!school) return res.status(404).json({ message: "School not found" });
        const classArm = new ClassArm({
            school: school_id,
            name,
            totalNumberOfStudents
        });
        await classArm.save();
        res.status(201).json(classArm);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


exports.updateClassArm = async (req, res) => {
    try {
        const classArm = await ClassArm.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!classArm) return res.status(404).json({ message: "Class Arm not found" });
        res.status(200).json(classArm);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteClassArm = async (req, res) => {
    try {
        const classArm = await ClassArm.findByIdAndDelete(req.params.id);
        if (!classArm) return res.status(404).json({ message: "Class Arm not found" });
        res.status(200).json({ message: "Class Arm deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
