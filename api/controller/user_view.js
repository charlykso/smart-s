const User = require('../model/User');
const bcrypt = require('bcryptjs');
const Profile = require('../model/Profile');


exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password -__v').populate('school', 'name').populate('classArm', 'name').populate('profile', 'img');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getICT_administrators = async (req, res) => {
    try {
        const ICT_administrators = await User.find({ roles: 'ICT_administrator' }).select('-password -__v').populate('profile', 'img');
        res.status(200).json(ICT_administrators);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

},

exports.getAuditors = async (req, res) => {
    try {
        const auditors = await User.find({ roles: 'Auditor' }).select('-password -__v').populate('profile', 'img');
        res.status(200).json(auditors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};

exports.getProprietors = async (req, res) => {
    try {
        const proprietors = await User.find({ roles: 'Proprietor' }).select('-password -__v').populate('profile', 'img');
        res.status(200).json(proprietors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getPrincipals = async (req, res) => {
    try {
        const principals = await User.find({ roles: 'Principal' }).select('-password -__v').populate('profile', 'img');
        res.status(200).json(principals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getHeadteachers = async (req, res) => {
    try {
        const headteachers = await User.find({ roles: 'Headteacher' }).select('-password -__v').populate('profile', 'img');
        res.status(200).json(headteachers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
exports.getBursars = async (req, res) => {
    try {
        const bursars = await User.find({ roles: 'Bursar' }).select('-password -__v').populate('profile', 'img');
        res.status(200).json(bursars);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getStudents = async (req, res) => {
    try {
        const students = await User.find({ roles: 'Student' }).select('-password -__v').populate('profile', 'img');
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getParents = async (req, res) => {
    try {
        const parents = await User.find({ roles: 'Parent' }).select('-password -__v').populate('name');
        res.status(200).json(parents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getStudentsInParticularSchool = async (req, res) => {
    try {
        const school_id = req.params.school_id;
        const students = await User.find({
            roles: 'Student',
            school: school_id
        })
        .select('-password -__v')
        .populate('school', 'name')
        .populate('classArm', 'name')
        .populate('profile');
        if (students.length === 0) {
            return res.status(404).json({ message: 'No students found for this school' });
        }
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getParentsInParticularSchool = async (req, res) => {

    try {
        const parents = await User.find({ roles: 'Parent', school_id: req.params.school_id }).select('-password -__v').populate('profile', 'img');
        res.status(200).json(parents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};

exports.getICT_administrator = async (req, res) => {
    try {
        const ICT_administrator = await User.findById({ roles: 'ICT_administrator', _id: req.params.id }).select('-password -__v').populate('name');
        res.status(200).json(ICT_administrator);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAuditor = async (req, res) => {
    try {
        const auditor = await User.findById({ roles: 'auditor', _id: req.params.id }).select('-password -__v').populate('name');
        res.status(200).json(auditor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProprietor = async (req, res) => {
    try {
        const proprietor = await User.findById({ roles: 'proprietor', _id: req.params.id }).select('-password -__v').populate('name');
        res.status(200).json(proprietor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPrincipal = async (req, res) => {
    try {
        const principal = await User.findById({ roles: 'principal', _id: req.params.id }).select('-password -__v').populate('school', 'name').populate('profile', 'name');
        res.status(200).json(principal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getHeadteacher = async (req, res) => {
    try {
        const headteacher = await User.findOne({ roles: 'headteacher', _id: req.params.id }).select('-password -__v').populate('name');
        res.status(200).json(headteacher);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getBursar = async (req, res) => {
    try {
        const bursar = await User.findById({ roles: 'bursar', _id: req.params.id }).select('-password -__v').populate('name');
        res.status(200).json(bursar);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getStudent = async (req, res) => {
    try {
        const student = await User.findById({ roles: 'student', _id: req.params.id }).select('-password -__v');
        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};

exports.getParent = async (req, res) => {
    try {
        const parent = await User.findById({ roles: 'parent', _id: req.params.id }).select('-password -__v').populate('name');
        res.status(200).json(parent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};

exports.createICT_administrator = async (req, res) => {
    try {
        const { school_id, firstname, middlename, lastname, email, phone, address_id, DOB, gender, roles, password } = req.body;
        if (school_id === "" || firstname === "" || middlename === "" || lastname === "" || email === "" || phone === "" || address_id === "" || DOB === "" || gender === "" || roles === "" || password === "") {
            return res.status(400).json({ message: 'All fields are required' });

        }
        const existingUser = await User.findOne({ email: email, phone: phone });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const profile = new Profile({ });
        const profile_id = await profile.save();
        const ICT_administrator = new User({
            school: school_id,
            firstname,
            middlename,
            lastname,
            email,
            phone,
            address: address_id,
            profile: profile_id,
            DOB,
            gender,
            roles: ['ICT_administrator'],
            password: hashedPassword
         });
        await ICT_administrator.save();
        res.status(201).json({ message: 'ICT administrator and profile created successfully'});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};

exports.createAuditor = async (req, res) => {
    try {
        const { school_id, firstname, middlename, lastname, email, phone, address_id, DOB, gender, roles, password } = req.body;
        if (school_id === "" || firstname === "" || middlename === "" || lastname === "" || email === "" || phone === "" || address_id === "" || DOB === "" || gender === "" || roles === "" || password === "") {
            return res.status(400).json({ message: 'All fields are required' });

        }
        const existingUser = await User.findOne({ email: email, phone: phone });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const profile = new Profile({ });
        const profile_id = await profile.save();
        const auditor = new User({
            school: school_id,
            firstname,
            middlename,
            lastname,
            email,
            phone,
            address: address_id,
            profile: profile_id,
            DOB,
            gender,
            roles: ['Auditor'],
            password: hashedPassword
         });
        await auditor.save();
        res.status(201).json({ message: 'Auditor and profile created successfully'});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}

exports.createProprietor = async (req, res) => {
    try {
        const { school_id, firstname, middlename, lastname, email, phone, address_id, DOB, gender, roles, password } = req.body;
        if (school_id === "" || firstname === "" || middlename === "" || lastname === "" || email === "" || phone === "" || address_id === "" || DOB === "" || gender === "" || roles === "" || password === "") {
            return res.status(400).json({ message: 'All fields are required' });
        
        }
        const existingUser = await User.findOne({ email: email, phone: phone });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const profile = new Profile({ });
        const profile_id = await profile.save();
        const proprietor = new User({ 
            school: school_id,
            firstname,
            middlename,
            lastname,
            email,
            phone,
            address: address_id,
            profile: profile_id,
            DOB,
            gender,
            roles: ['Proprietor'],
            password: hashedPassword
         });
        await proprietor.save();
        res.status(201).json({ message: 'Proprietor created successfully'});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createPrincipal = async (req, res) => {
    try {
        const { school_id, firstname, middlename, lastname, email, phone, address_id, DOB, gender, roles, password } = req.body;
        if (school_id === "" || firstname === "" || middlename === "" || lastname === "" || email === "" || phone === "" || address_id === "" || DOB === "" || gender === "" || roles === "" || password === "") {
            return res.status(400).json({ message: 'All fields are required' });
        
        }
        const existingUser = await User.findOne({ email: email, phone: phone });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const profile = new Profile({ });
        const profile_id = await profile.save();
        const principal = new User({ 
            school: school_id,
            firstname,
            middlename,
            lastname,
            email,
            phone,
            address: address_id,
            profile: profile_id,
            DOB,
            gender,
            roles: ['Principal'],
            password: hashedPassword
         });
        await principal.save();
        res.status(201).json({ message: 'Principal created successfully'});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createHeadteacher = async (req, res) => {
    try {
        const { school_id, firstname, middlename, lastname, email, phone, address_id, DOB, gender, roles, password } = req.body;
        if (school_id === "" || firstname === "" || middlename === "" || lastname === "" || email === "" || phone === "" || address_id === "" || DOB === "" || gender === "" || roles === "" || password === "") {
            return res.status(400).json({ message: 'All fields are required' });
        
        }
        const existingUser = await User.findOne({ email: email, phone: phone });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const profile = new Profile({ });
        const profile_id = await profile.save();
        const headteacher = new User({ 
            school: school_id,
            firstname,
            middlename,
            lastname,
            email,
            phone,
            address: address_id,
            profile: profile_id,
            DOB,
            gender,
            roles: ['Headteacher'],
            password: hashedPassword
         });
        await headteacher.save();
        res.status(201).json({ message: 'Headteacher created successfully'});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createBursar = async (req, res) => {
    try {
        const { school_id, firstname, middlename, lastname, email, phone, address_id, DOB, gender, roles, password } = req.body;
        if (school_id === "" || firstname === "" || middlename === "" || lastname === "" || email === "" || phone === "" || address_id === "" || DOB === "" || gender === "" || roles === "" || password === "") {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const profile = new Profile({ });
        const profile_id = await profile.save();
        const bursar = new User({ 
            school: school_id,
            firstname,
            middlename,
            lastname,
            email,
            phone,
            address: address_id,
            profile: profile_id,
            DOB,
            gender,
            roles: ['Bursar'],
            password: hashedPassword
         });
         await bursar.save();
        res.status(201).json({ message: 'Bursar created successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createStudent = async (req, res) => {
    try {
        const { school_id, firstname, middlename, lastname, regNo, email, phone, address_id, DOB, gender, classArm_id, type, roles, password } = req.body;
        if (school_id === "" || firstname === "" || middlename === "" || lastname === "" || regNo === "" || email === "" || phone === "" || address_id === "" || DOB === "" || gender === "" || classArm_id === "" || type === "" || roles === "" || password === "") {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const existingUser = await User.findOne({ regNo: regNo });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const profile = new Profile({ });
        const profile_id = await profile.save();
        const student = new User({ 
            school: school_id,
            firstname,
            middlename,
            lastname,
            regNo,
            email,
            phone,
            address: address_id,
            profile: profile_id,
            DOB,
            gender,
            classArm: classArm_id,
            type,
            roles: ['Student'],
            password: hashedPassword
         });
         await student.save();
        res.status(201).json({ message: 'Student created successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createParent = async (req, res) => {
    try {
        const { school_id, firstname, middlename, lastname, student_id, email, phone, address_id, DOB, gender, roles, password } = req.body;
        if (school_id === "" || firstname === "" || middlename === "" || lastname === "" || student_id === "" || email === "" || phone === "" || address_id === "" || DOB === "" || gender === "" || roles === "" || password === "") {
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
        const profile = new Profile({ });
        const profile_id = await profile.save();
        const parent = new User({
            school: school_id,
            firstname,
            middlename,
            lastname,
            student: student_id,
            email,
            phone,
            address: address_id,
            profile: profile_id,
            DOB,
            gender,
            roles: ['Parent'],
            password: hashedPassword
         }); 
        await parent.save();
        res.status(201).json({ message: 'Parent created successfully'});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateICT_administrator = async (req, res) => {
    try {
        const { id } = req.params;
        const { school_id, firstname, middlename, lastname, email, phone, address_id, DOB, gender, roles } = req.body;
        if (school_id === "" || firstname === "" || middlename === "" || lastname === "" || email === "" || phone === "" || address_id === "" || DOB === "" || gender === "" || roles === "") {
            return res.status(400).json({ message: 'All fields are required' });

        }
        const ict_administrator = await User.findByIdAndUpdate(id, { school_id, firstname, middlename, lastname, email, phone, address_id, DOB, gender, roles }, { new: true });
        if (!ict_administrator) {
            return res.status(404).json({ message: 'ICT administrator not found' });
        }
        res.status(200).json({ message: 'ICT administrator updated successfully'});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateAuditor = async (req, res) => {
    try {
        const { id } = req.params;
        const { school_id, firstname, middlename, lastname, email, phone, address_id, DOB, gender, roles } = req.body;
        if (school_id === "" || firstname === "" || middlename === "" || lastname === "" || email === "" || phone === "" || address_id === "" || DOB === "" || gender === "" || roles === "") {
            return res.status(400).json({ message: 'All fields are required' });

        }
        const auditor = await User.findByIdAndUpdate(id, { school_id, firstname, middlename, lastname, email, phone, address_id, DOB, gender, roles }, { new: true });
        if (!auditor) {
            return res.status(404).json({ message: 'Auditor not found' });
        }
        res.status(200).json({ message: 'Auditor updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}

exports.updateProprietor = async (req, res) => {
    try {
        const { id } = req.params;
        const { school_id, firstname, middlename, lastname, email, phone, address_id, DOB, gender, roles } = req.body;
        if (school_id === "" || firstname === "" || middlename === "" || lastname === "" || email === "" || phone === "" || address_id === "" || DOB === "" || gender === "" || roles === "") {
            return res.status(400).json({ message: 'All fields are required' });

        }
        const proprietor = await User.findByIdAndUpdate(id, { school_id, firstname, middlename, lastname, email, phone, address_id, DOB, gender, roles }, { new: true });
        if (!proprietor) {
            return res.status(404).json({ message: 'Proprietor not found' });
        }
        
        res.status(200).json({ message: 'Proprietor updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updatePrincipal = async (req, res) => {
    try {
        const { id } = req.params;
        const { school_id, firstname, middlename, lastname, email, phone, address_id, DOB, gender, roles } = req.body;
        if (school_id === "" || firstname === "" || middlename === "" || lastname === "" || email === "" || phone === "" || address_id === "" || DOB === "" || gender === "" || roles === "") {
            return res.status(400).json({ message: 'All fields are required' });

        }
        const principal = await User.findByIdAndUpdate(id, { school_id, firstname, middlename, lastname, email, phone, address_id, DOB, gender, roles }, { new: true });
        if (!principal) {
            return res.status(404).json({ message: 'Principal not found' });
        }
        res.status(200).json({ message: 'Principal updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateHeadteacher = async (req, res) => {
    try {
        const { id } = req.params;
        const { school_id, firstname, middlename, lastname, email, phone, address_id, DOB, gender, roles } = req.body;
        if (school_id === "" || firstname === "" || middlename === "" || lastname === "" || email === "" || phone === "" || address_id === "" || DOB === "" || gender === "" || roles === "") {
            return res.status(400).json({ message: 'All fields are required' });

        }
        const headteacher = await User.findByIdAndUpdate(id, { school_id, firstname, middlename, lastname, email, phone, address_id, DOB, gender, roles }, { new: true });
        if (!headteacher) {
            return res.status(404).json({ message: 'Headteacher not found' });
        }
        res.status(200).json({ message: 'Headteacher updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateBursar = async (req, res) => {
    try {
        const { id } = req.params;
        const { school_id, firstname, middlename, lastname, email, phone, address_id, DOB, gender, roles } = req.body;
        if (school_id === "" || firstname === "" || middlename === "" || lastname === "" || email === "" || phone === "" || address_id === "" || DOB === "" || gender === "" || roles === "") {
            return res.status(400).json({ message: 'All fields are required' });

        }
        const bursar = await User.findByIdAndUpdate(id, { school_id, firstname, middlename, lastname, email, phone, address_id, DOB, gender, roles }, { new: true });
        if (!bursar) {
            return res.status(404).json({ message: 'Bursar not found' });
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
        res.status(200).json({ message: 'Student updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateParent = async (req, res) => {
    try {
        const { id } = req.params;
        const { school_id, firstname, middlename, lastname, student_id, email, phone, address_id, DOB, gender, roles } = req.body;
        if (school_id === "" || firstname === "" || middlename === "" || lastname === "" || student_id === "" || email === "" || phone === "" || address_id === "" || DOB === "" || gender === "" || roles === "") {
            return res.status(400).json({ message: 'All fields are required' });

        }
        const parent = await User.findByIdAndUpdate(id, { school_id, firstname, middlename, lastname, student_id, email, phone, address_id, DOB, gender, roles }, { new: true });
        if (!parent) {
            return res.status(404).json({ message: 'Parent not found' });
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