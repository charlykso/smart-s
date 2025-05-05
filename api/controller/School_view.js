const School = require('../model/School')
const GroupSchool = require('../model/GroupSchool')
const Address = require('../model/Address')

exports.getSchools = async (req, res) =>{
    try{
        const school = await School.find().populate('address', 'name').populate('groupSchool', 'name')
        res.status(200).json(school)
    }catch(error){
        res.status(500).json({message: error.message})
    }
}

exports.getSchool = async (req, res) =>{
    try{
        const school = await School.findById(req.params.id).populate('address', 'name').populate('groupSchool', 'name')
        if(!school) return res.status(404).json({message: "School not found"})
            res.json(school)
    }catch(error){
        res.status(500).json({message: error.message})
    }
}

exports.createSchool = async (req, res) =>{
    try{
        const {groupSchool_id, schoolName, address_id, email, phoneNumber}= req.body
        const groupSchool = await GroupSchool.findById(groupSchool_id)
        const address = await Address.findById(address_id)
        if (!groupSchool && !address) return res.status(404).json({message: "GroupSchool or Address not found"})

        const school = new School({
            groupSchool: groupSchool_id,
            address: address_id,
            schoolName,
            email,
            phoneNumber,
        })
        await school.save()

        res.status(201).json(school)
    }catch(error){
        res.status(400).json({message: error.message})
    }
}

exports.updateSchool = async (req, res) =>{
    try{
        const school = await School.findById(req.params.id)
        if (!school) return res.status(404).json({message: 'School not found'})
        
        school.groupSchool = req.body.groupSchool_id
        school.address = req.body.address_id
        school.schoolName = req.body.schoolName
        school.email = req.body.email
        school.phoneNumber = req.body.phoneNumber

        const updatedSchool = await school.save()
        res.status(200).json(updatedSchool)
    }catch(error){
        res.status(400).json({message: error.message})
    }
}

exports.deleteSchool = async (req, res) =>{
    try{
        const school = await School.findById(req.params.id)
        if(!school) return res.status(404).json({message:"School not found"})
        await School.deleteOne({_id:req.params.id})
        res.status(200).json({message: "School deleted successfully"})
    }catch(error){
        res.status(500).json({message: error.message})
    }
}

exports.getSchoolByAddress = async (req, res) =>{
    try{
        const school = await School.find({addressId: req.params.id}).populate('address', 'name')
        res.status(200).json(school)
    }catch(error){
        res.status(500).json({message: error.message})
    }
}

exports.getSchoolByGroupSchool = async (req, res) =>{
    try{
        const groupSchool = await GroupSchool.findById(req.params.id)
        if(!groupSchool) return res.status(404).json({message: "GroupSchool not found"})
        const schools = await School.find({groupSchool: req.params.id}).populate('address', 'country city state street').populate('groupSchool', 'name')
        if(!schools) return res.status(404).json({message: "No school found for this GroupSchool"})
        res.status(200).json(schools)
    }catch(error){
        res.status(500).json({message: error.message})
    }
}
