const User = require('../model/User');
const bcrypt = require('bcryptjs');
const Profile = require('../model/Profile');


exports.getICT_administrators = async (req, res) => {
    try {
        const ICT_administrators = await User.find({ role: 'ICT_administrator' }).select('-password -__v').populate('profile', 'img');
        res.status(200).json(ICT_administrators);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

},

exports.getAuditors = async (req, res) => {
    try {
        const auditors = await User.find({ role: 'Auditor' }).select('-password -__v').populate('profile', 'img');
        res.status(200).json(auditors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};

exports.getProprietors = async (req, res) => {
    try {
        const proprietors = await User.find({ role: 'Proprietor' }).select('-password -__v').populate('profile', 'img');
        res.status(200).json(proprietors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getPrincipals = async (req, res) => {
    try {
        const principals = await User.find({ role: 'Principal' }).select('-password -__v').populate('profile', 'img');
        res.status(200).json(principals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getHeadteachers = async (req, res) => {
    try {
        const headteachers = await User.find({ role: 'Headteacher' }).select('-password -__v').populate('profile', 'img');
        res.status(200).json(headteachers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
exports.getBursars = async (req, res) => {
    try {
        const bursars = await User.find({ role: 'Bursar' }).select('-password -__v').populate('profile', 'img');
        res.status(200).json(bursars);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'Student' }).select('-password -__v').populate('profile', 'img');
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getParents = async (req, res) => {
    try {
        const parents = await User.find({ role: 'Parent' }).select('-password -__v').populate('name');
        res.status(200).json(parents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getStudentsInParticularSchool = async (req, res) => {
    try {
        const students = await User.find({ role: 'Student', school_id: req.params.school_id }).select('-password -__v').populate('profile', 'img');
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getParentsInParticularSchool = async (req, res) => {

    try {
        const parents = await User.find({ role: 'Parent', school_id: req.params.school_id }).select('-password -__v').populate('profile', 'img');
        res.status(200).json(parents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};

exports.getICT_administrator = async (req, res) => {
    try {
        const ICT_administrator = await User.findOne({ role: 'ICT_administrator', _id: req.params.id }).select('-password -__v').populate('name');
        res.status(200).json(ICT_administrator);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAuditor = async (req, res) => {
    try {
        const auditor = await User.findOne({ role: 'auditor', _id: req.params.id }).select('-password -__v').populate('name');
        res.status(200).json(auditor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProprietor = async (req, res) => {
    try {
        const proprietor = await User.findOne({ role: 'proprietor', _id: req.params.id }).select('-password -__v').populate('name');
        res.status(200).json(proprietor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPrincipal = async (req, res) => {
    try {
        const principal = await User.findOne({ role: 'principal', _id: req.params.id }).select('-password -__v').populate('name');
        res.status(200).json(principal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getHeadteacher = async (req, res) => {
    try {
        const headteacher = await User.findOne({ role: 'headteacher', _id: req.params.id }).select('-password -__v').populate('name');
        res.status(200).json(headteacher);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getBursar = async (req, res) => {
    try {
        const bursar = await User.findOne({ role: 'bursar', _id: req.params.id }).select('-password -__v').populate('name');
        res.status(200).json(bursar);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getStudent = async (req, res) => {
    try {
        const student = await User.findOne({ role: 'student', _id: req.params.id }).select('-password -__v').populate('name');
        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};

exports.getParent = async (req, res) => {
    try {
        const parent = await User.findOne({ role: 'parent', _id: req.params.id }).select('-password -__v').populate('name');
        res.status(200).json(parent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};

exports.createICT_administrator = async (req, res) => {
    try {
        const { school_id, firstname, middlename, lastname, email, phone, address_id, DOB, gender, type, role, password } = req.body;
        if (school_id === "" || firstname === "" || middlename === "" || lastname === "" || email === "" || phone === "" || address_id === "" || DOB === "" || gender === "" || type === "" || role === "" || password === "") {
            return res.status(400).json({ message: 'All fields are required' });

        }
        const existingUser = await User.findOne({ email: email, phone: phone });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const ICT_administrator = new User({
            school: school_id,
            firstname,
            middlename,
            lastname,
            email,
            phone,
            address: address_id,
            DOB,
            gender,
            type,
            role: 'ICT_administrator',
            password: hashedPassword
         });
        const newICT_administrator = await ICT_administrator.save();
        const profile = new Profile({
            user: newICT_administrator._id,
        })
        await profile.save();
        const returnICT_administrator = {
            _id: newICT_administrator._id,
            school: newICT_administrator.school,
            firstname: newICT_administrator.firstname,
            middlename: newICT_administrator.middlename,
            lastname: newICT_administrator.lastname,
            email: newICT_administrator.email,
            phone: newICT_administrator.phone,
            address: newICT_administrator.address,
            DOB: newICT_administrator.DOB,
            gender: newICT_administrator.gender,
            type: newICT_administrator.type,
            role: newICT_administrator.role
        }
        res.status(201).json({ message: 'ICT administrator and profile created successfully',
            userId: savedUser._id,
            profileId: profile._id
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};

exports.createAuditor = async (req, res) => {
    try {
        const { school_id, firstname, middlename, lastname, email, phone, address_id, DOB, gender, type, role, password } = req.body;
        if (school_id === "" || firstname === "" || middlename === "" || lastname === "" || email === "" || phone === "" || address_id === "" || DOB === "" || gender === "" || type === "" || role === "" || password === "") {
            return res.status(400).json({ message: 'All fields are required' });

        }
        const existingUser = await User.findOne({ email: email, phone: phone });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const auditor = new User({
            school: school_id,
            firstname,
            middlename,
            lastname,
            email,
            phone,
            address: address_id,
            DOB,
            gender,
            type,
            role: 'auditor',
            password: hashedPassword
         });
        const newAuditor = await auditor.save();
        const profile = new Profile({
            user: newAuditor._id,
        })
        await profile.save();
        const returnAuditor = {
            _id: newAuditor._id,
            school: newAuditor.school,
            firstname: newAuditor.firstname,
            middlename: newAuditor.middlename,
            lastname: newAuditor.lastname,
            email: newAuditor.email,
            phone: newAuditor.phone,
            address: newAuditor.address,
            DOB: newAuditor.DOB,
            gender: newAuditor.gender,
            type: newAuditor.type,
            role: newAuditor.role
        }
        res.status(201).json({ message: 'Auditor and profile created successfully',
            userId: savedUser._id,
            profileId: profile._id
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}

exports.createProprietor = async (req, res) => {
    try {
        const { school_id, firstname, middlename, lastname, email, phone, address_id, DOB, gender, type, role, password } = req.body;
        if (school_id === "" || firstname === "" || middlename === "" || lastname === "" || email === "" || phone === "" || address_id === "" || DOB === "" || gender === "" || type === "" || role === "" || password === "") {
            return res.status(400).json({ message: 'All fields are required' });
        
        }
        const existingUser = await User.findOne({ email: email, phone: phone });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const proprietor = new User({ 
            school: school_id,
            firstname,
            middlename,
            lastname,
            email,
            phone,
            address: address_id,
            DOB,
            gender,
            type,
            role: 'proprietor',
            password: hashedPassword
         });
        const newProprietor = await proprietor.save();
        const profile = new Profile({
            user: newProprietor._id,
        })
        await profile.save();
        const returnProprietor = {
            _id: newProprietor._id,
            school: newProprietor.school,
            firstname: newProprietor.firstname,
            middlename: newProprietor.middlename,
            lastname: newProprietor.lastname,
            email: newProprietor.email,
            phone: newProprietor.phone,
            address: newProprietor.address,
            DOB: newProprietor.DOB,
            gender: newProprietor.gender,
            type: newProprietor.type,
            role: newProprietor.role
        }
        res.status(201).json({ message: 'Proprietor created successfully',
            userId: savedUser._id,
            profileId: profile._id
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createPrincipal = async (req, res) => {
    try {
        const { school_id, firstname, middlename, lastname, email, phone, address_id, DOB, gender, type, role, password } = req.body;
        if (school_id === "" || firstname === "" || middlename === "" || lastname === "" || email === "" || phone === "" || address_id === "" || DOB === "" || gender === "" || type === "" || role === "" || password === "") {
            return res.status(400).json({ message: 'All fields are required' });
        
        }
        const existingUser = await User.findOne({ email: email, phone: phone });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const principal = new User({ 
            school: school_id,
            firstname,
            middlename,
            lastname,
            email,
            phone,
            address: address_id,
            DOB,
            gender,
            type,
            role: 'principal',
            password: hashedPassword
         });
        const newPrincipal = await principal.save();
        const profile = new Profile({
            user: newPrincipal._id,
        })
        await profile.save();
        const returnPrincipal = {
            _id: newPrincipal._id,
            school: newPrincipal.school,
            firstname: newPrincipal.firstname,
            middlename: newPrincipal.middlename,
            lastname: newPrincipal.lastname,
            email: newPrincipal.email,
            phone: newPrincipal.phone,
            address: newPrincipal.address,
            DOB: newPrincipal.DOB,
            gender: newPrincipal.gender,
            type: newPrincipal.type,
            role: newPrincipal.role
        }
        res.status(201).json({ message: 'Principal created successfully', 
            userId: savedUser._id,
            profileId: profile._id
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createHeadteacher = async (req, res) => {
    try {
        const { school_id, firstname, middlename, lastname, email, phone, address_id, DOB, gender, type, role, password } = req.body;
        if (school_id === "" || firstname === "" || middlename === "" || lastname === "" || email === "" || phone === "" || address_id === "" || DOB === "" || gender === "" || type === "" || role === "" || password === "") {
            return res.status(400).json({ message: 'All fields are required' });
        
        }
        const existingUser = await User.findOne({ email: email, phone: phone });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const headteacher = new User({ 
            school: school_id,
            firstname,
            middlename,
            lastname,
            email,
            phone,
            address: address_id,
            DOB,
            gender,
            type,
            role: 'headteacher',
            password: hashedPassword
         });
        const newHeadteacher = await headteacher.save();
        const profile = new Profile({
            user: newHeadteacher._id,
        })
        await profile.save();
        const returnHeadteacher = {
            _id: newHeadteacher._id,
            school: newHeadteacher.school,
            firstname: newHeadteacher.firstname,
            middlename: newHeadteacher.middlename,
            lastname: newHeadteacher.lastname,
            email: newHeadteacher.email,
            phone: newHeadteacher.phone,
            address: newHeadteacher.address,
            DOB: newHeadteacher.DOB,
            gender: newHeadteacher.gender,
            type: newHeadteacher.type,
            role: newHeadteacher.role
        }
        res.status(201).json({ message: 'Headteacher created successfully', 
            userId: savedUser._id,
            profileId: profile._id
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createBursar = async (req, res) => {
    try {
        const { school_id, firstname, middlename, lastname, email, phone, address_id, DOB, gender, type, role, password } = req.body;
        if (school_id === "" || firstname === "" || middlename === "" || lastname === "" || email === "" || phone === "" || address_id === "" || DOB === "" || gender === "" || type === "" || role === "" || password === "") {
            return res.status(400).json({ message: 'All fields are required' });
        
        }
        const existingUser = await User.findOne({ email: email, phone: phone });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const bursar = new User({ 
            school: school_id,
            firstname,
            middlename,
            lastname,
            email,
            phone,
            address: address_id,
            DOB,
            gender,
            type,
            role: 'bursar',
            password: hashedPassword
         });
        const newBursar = await bursar.save();
        const profile = new Profile({
            user: newBursar._id,
        })
        await profile.save();
        const returnBursar = {
            _id: newBursar._id,
            school: newBursar.school,
            firstname: newBursar.firstname,
            middlename: newBursar.middlename,
            lastname: newBursar.lastname,
            email: newBursar.email,
            phone: newBursar.phone,
            address: newBursar.address,
            DOB: newBursar.DOB,
            gender: newBursar.gender,
            type: newBursar.type,
            role: newBursar.role
        }
        res.status(201).json({ message: 'Bursar created successfully', 
            userId: savedUser._id,
            profileId: profile._id
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createStudent = async (req, res) => {
    try {
        const { school_id, firstname, middlename, lastname, regNo, email, phone, address_id, DOB, gender, classArm_id, type, role, password } = req.body;
        if (school_id === "" || firstname === "" || middlename === "" || lastname === "" || regNo === "" || email === "" || phone === "" || address_id === "" || DOB === "" || gender === "" || classArm_id === "" || type === "" || role === "" || password === "") {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const existingUser = await User.findOne({ regNo: regNo });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const student = new User({ 
            school: school_id,
            firstname,
            middlename,
            lastname,
            regNo,
            email,
            phone,
            address: address_id,
            DOB,
            gender,
            classArm: classArm_id,
            type,
            role: 'Student',
            password: hashedPassword
         });
        const newStudent = await student.save();
        const profile = new Profile({
            user: newStudent._id,
        })
        await profile.save();
        res.status(201).json({ message: 'Student created successfully', 
            userId: savedUser._id,
            profileId: profile._id
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createParent = async (req, res) => {
    try {
        const { school_id, firstname, middlename, lastname, student_id, email, phone, address_id, DOB, gender, type, role, password } = req.body;
        if (school_id === "" || firstname === "" || middlename === "" || lastname === "" || student_id === "" || email === "" || phone === "" || address_id === "" || DOB === "" || gender === "" || type === "" || role === "" || password === "") {
            return res.status(400).json({ message: 'All fields are required' });
        
        }

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const existingUser = await User.findOne({ email: email, phone: phone  });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const parent = new User({
            school: school_id,
            firstname,
            middlename,
            lastname,
            student: student_id,
            email,
            phone,
            address: address_id,
            DOB,
            gender,
            type,
            role: 'parent',
            password: hashedPassword
         }); 
        const newParent = await parent.save();
        const profile = new Profile({
            user: newParent._id,
        })
        await profile.save();
        const returnParent = {
            _id: newParent._id,
            school: newParent.school,
            firstname: newParent.firstname,
            middlename: newParent.middlename,
            lastname: newParent.lastname,
            student: newParent.student_id,
            email: newParent.email,
            phone: newParent.phone,
            address: newParent.address,
            DOB: newParent.DOB,
            gender: newParent.gender,
            type: newParent.type,
            role: newParent.role
        }
        res.status(201).json({ message: 'Parent created successfully', 
            userId: savedUser._id,
            profileId: profile._id
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateICT_administrator = async (req, res) => {
    try {
        const { id } = req.params;
        const { school_id, firstname, middlename, lastname, email, phone, address_id, DOB, gender, type, role } = req.body;
        if (school_id === "" || firstname === "" || middlename === "" || lastname === "" || email === "" || phone === "" || address_id === "" || DOB === "" || gender === "" || type === "" || role === "") {
            return res.status(400).json({ message: 'All fields are required' });

        }
        const ict_administrator = await User.findByIdAndUpdate(id, { school_id, firstname, middlename, lastname, email, phone, address_id, DOB, gender, type, role }, { new: true });
        if (!ict_administrator) {
            return res.status(404).json({ message: 'ICT administrator not found' });
        }
        const returnICT_administrator = {
            _id: ict_administrator._id,
            school: ict_administrator.school,
            firstname: ict_administrator.firstname,
            middlename: ict_administrator.middlename,
            lastname: ict_administrator.lastname,
            email: ict_administrator.email,
            phone: ict_administrator.phone,
            address: ict_administrator.address,
            DOB: ict_administrator.DOB,
            gender: ict_administrator.gender,
            type: ict_administrator.type,
            role: ict_administrator.role
        }
        res.status(200).json({ message: 'ICT administrator updated successfully',
            userId: savedUser._id,
            profileId: profile._id
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateAuditor = async (req, res) => {
    try {
        const { id } = req.params;
        const { school_id, firstname, middlename, lastname, email, phone, address_id, DOB, gender, type, role } = req.body;
        if (school_id === "" || firstname === "" || middlename === "" || lastname === "" || email === "" || phone === "" || address_id === "" || DOB === "" || gender === "" || type === "" || role === "") {
            return res.status(400).json({ message: 'All fields are required' });

        }
        const auditor = await User.findByIdAndUpdate(id, { school_id, firstname, middlename, lastname, email, phone, address_id, DOB, gender, type, role }, { new: true });
        if (!auditor) {
            return res.status(404).json({ message: 'Auditor not found' });
        }
        const returnAuditor = {
            _id: auditor._id,
            school: auditor.school,
            firstname: auditor.firstname,
            middlename: auditor.middlename,
            lastname: auditor.lastname,
            email: auditor.email,
            phone: auditor.phone,
            address: auditor.address,
            DOB: auditor.DOB,
            gender: auditor.gender,
            type: auditor.type,
            role: auditor.role
        }
        res.status(200).json({ message: 'Auditor updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}

exports.updateProprietor = async (req, res) => {
    try {
        const { id } = req.params;
        const { school_id, firstname, middlename, lastname, email, phone, address_id, DOB, gender, type, role } = req.body;
        if (school_id === "" || firstname === "" || middlename === "" || lastname === "" || email === "" || phone === "" || address_id === "" || DOB === "" || gender === "" || type === "" || role === "") {
            return res.status(400).json({ message: 'All fields are required' });

        }
        const proprietor = await User.findByIdAndUpdate(id, { school_id, firstname, middlename, lastname, email, phone, address_id, DOB, gender, type, role }, { new: true });
        if (!proprietor) {
            return res.status(404).json({ message: 'Proprietor not found' });
        }
        const returnProprietor = {
            _id: proprietor._id,
            school: proprietor.school,
            firstname: proprietor.firstname,
            middlename: proprietor.middlename,
            lastname: proprietor.lastname,
            email: proprietor.email,
            phone: proprietor.phone,
            address: proprietor.address,
            DOB: proprietor.DOB,
            gender: proprietor.gender,
            type: proprietor.type,
            role: proprietor.role
        }
        res.status(200).json({ message: 'Proprietor updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updatePrincipal = async (req, res) => {
    try {
        const { id } = req.params;
        const { school_id, firstname, middlename, lastname, email, phone, address_id, DOB, gender, type, role } = req.body;
        if (school_id === "" || firstname === "" || middlename === "" || lastname === "" || email === "" || phone === "" || address_id === "" || DOB === "" || gender === "" || type === "" || role === "") {
            return res.status(400).json({ message: 'All fields are required' });

        }
        const principal = await User.findByIdAndUpdate(id, { school_id, firstname, middlename, lastname, email, phone, address_id, DOB, gender, type, role }, { new: true });
        if (!principal) {
            return res.status(404).json({ message: 'Principal not found' });
        }
        const returnPrincipal = {
            _id: principal._id,
            school: principal.school,
            firstname: principal.firstname,
            middlename: principal.middlename,
            lastname: principal.lastname,
            email: principal.email,
            phone: principal.phone,
            address: principal.address,
            DOB: principal.DOB,
            gender: principal.gender,
            type: principal.type,
            role: principal.role
        }
        res.status(200).json({ message: 'Principal updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateHeadteacher = async (req, res) => {
    try {
        const { id } = req.params;
        const { school_id, firstname, middlename, lastname, email, phone, address_id, DOB, gender, type, role } = req.body;
        if (school_id === "" || firstname === "" || middlename === "" || lastname === "" || email === "" || phone === "" || address_id === "" || DOB === "" || gender === "" || type === "" || role === "") {
            return res.status(400).json({ message: 'All fields are required' });

        }
        const headteacher = await User.findByIdAndUpdate(id, { school_id, firstname, middlename, lastname, email, phone, address_id, DOB, gender, type, role }, { new: true });
        if (!headteacher) {
            return res.status(404).json({ message: 'Headteacher not found' });
        }
        const returnHeadteacher = {
            _id: headteacher._id,
            school: headteacher.school,
            firstname: headteacher.firstname,
            middlename: headteacher.middlename,
            lastname: headteacher.lastname,
            email: headteacher.email,
            phone: headteacher.phone,
            address: headteacher.address,
            DOB: headteacher.DOB,
            gender: headteacher.gender,
            type: headteacher.type,
            role: headteacher.role
        }
        res.status(200).json({ message: 'Headteacher updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateBursar = async (req, res) => {
    try {
        const { id } = req.params;
        const { school_id, firstname, middlename, lastname, email, phone, address_id, DOB, gender, type, role } = req.body;
        if (school_id === "" || firstname === "" || middlename === "" || lastname === "" || email === "" || phone === "" || address_id === "" || DOB === "" || gender === "" || type === "" || role === "") {
            return res.status(400).json({ message: 'All fields are required' });

        }
        const bursar = await User.findByIdAndUpdate(id, { school_id, firstname, middlename, lastname, email, phone, address_id, DOB, gender, type, role }, { new: true });
        if (!bursar) {
            return res.status(404).json({ message: 'Bursar not found' });
        }
        const returnBursar = {
            _id: bursar._id,
            school: bursar.school,
            firstname: bursar.firstname,
            middlename: bursar.middlename,
            lastname: bursar.lastname,
            email: bursar.email,
            phone: bursar.phone,
            address: bursar.address,
            DOB: bursar.DOB,
            gender: bursar.gender,
            type: bursar.type,
            role: bursar.role
        }
        res.status(200).json({ message: 'Bursar updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { school_id, firstname, middlename, lastname, regNo, email, phone, address_id, DOB, gender, classArm_id, type, role } = req.body;
        if (school_id === "" || firstname === "" || middlename === "" || lastname === "" || regNo === "" || email === "" || phone === "" || address_id === "" || DOB === "" || gender === "" || classArm_id === "" || type === "" || role === "") {
            return res.status(400).json({ message: 'All fields are required' });

        }
        const student = await User.findByIdAndUpdate(id, { school_id, firstname, middlename, lastname, regNo, email, phone, address_id, DOB, gender, classArm_id, type, role }, { new: true });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        const returnStudent = {
            _id: student._id,
            school: student.school,
            firstname: student.firstname,
            middlename: student.middlename,
            lastname: student.lastname,
            regNo: student.regNo,
            email: student.email,
            phone: student.phone,
            address: student.address,
            DOB: student.DOB,
            gender: student.gender,
            classArm: student.classArm,
            type: student.type,
            role: student.role
        }
        res.status(200).json({ message: 'Student updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateParent = async (req, res) => {
    try {
        const { id } = req.params;
        const { school_id, firstname, middlename, lastname, student_id, email, phone, address_id, DOB, gender, type, role } = req.body;
        if (school_id === "" || firstname === "" || middlename === "" || lastname === "" || student_id === "" || email === "" || phone === "" || address_id === "" || DOB === "" || gender === "" || type === "" || role === "") {
            return res.status(400).json({ message: 'All fields are required' });

        }
        const parent = await User.findByIdAndUpdate(id, { school_id, firstname, middlename, lastname, student_id, email, phone, address_id, DOB, gender, type, role }, { new: true });
        if (!parent) {
            return res.status(404).json({ message: 'Parent not found' });
        }
        const returnParent = {
            _id: parent._id,
            school: parent.school,
            firstname: parent.firstname,
            middlename: parent.middlename,
            lastname: parent.lastname,
            student: parent.student_id,
            email: parent.email,
            phone: parent.phone,
            address: parent.address,
            DOB: parent.DOB,
            gender: parent.gender,
            type: parent.type,
            role: parent.role
        }
        res.status(200).json({ message: 'Parent updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteICT_administrator = async (req, res) => {
    try {
        const { id } = req.params;
        const ICT_administrator = await User.findByIdAndDelete(id);
        if (!ICT_administrator) {
            return res.status(404).json({ message: 'ICT administrator not found' });
        }
        res.status(200).json({ message: 'ICT administrator deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteAuditor = async (req, res) => {
    try {
        const { id } = req.params;
        const auditor = await User.findByIdAndDelete(id);
        if (!auditor) {
            return res.status(404).json({ message: 'Auditor not found' });
        }
        res.status(200).json({ message: 'Auditor deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}
exports.deleteProprietor = async (req, res) => {
    try {
        const { id } = req.params;
        const proprietor = await User.findByIdAndDelete(id);
        if (!proprietor) {
            return res.status(404).json({ message: 'Proprietor not found' });
        }
        res.status(200).json({ message: 'Proprietor deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deletePrincipal = async (req, res) => {
    try {
        const { id } = req.params;
        const principal = await User.findByIdAndDelete(id);
        if (!principal) {
            return res.status(404).json({ message: 'Principal not found' });
        }
        res.status(200).json({ message: 'Principal deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteHeadteacher = async (req, res) => {
    try {
        const { id } = req.params;
        const headteacher = await User.findByIdAndDelete(id);
        if (!headteacher) {
            return res.status(404).json({ message: 'Headteacher not found' });
        }
        res.status(200).json({ message: 'Headteacher deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteBursar = async (req, res) => {
    try {
        const { id } = req.params;
        const bursar = await User.findByIdAndDelete(id);
        if (!bursar) {
            return res.status(404).json({ message: 'Bursar not found' });
        }
        res.status(200).json({ message: 'Bursar deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await User.findByIdAndDelete(id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteParent = async (req, res) => {
    try {
        const { id } = req.params;
        const parent = await User.findByIdAndDelete(id);
        if (!parent) {
            return res.status(404).json({ message: 'Parent not found' });
        }
        res.status(200).json({ message: 'Parent deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};