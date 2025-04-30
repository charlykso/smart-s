const School = require('../model/School')
const GroupSchool = require('../model/GroupSchool')
const Address = require('../model/Address')

exports.getSchools = async (req, res) =>{
    try{
        const school = await School.find().populate('addressId', 'name').populate('groupSchoolId', 'name')
        res.status(200).json(school)
    }catch(error){
        res.status(500).json({message: error.message})
    }
}

exports.getSchool = async (req, res) =>{
    try{
        const school = await School.findById(req.params.id).populate('addressId', 'name').populate('groupSchoolId', 'name')
        if(!school) return res.status(404).json({message: "School not found"})
            res.json(school)
    }catch(error){
        res.status(500).json({message: error.message})
    }
}

exports.createSchool = async (req, res) =>{
    try{
        const {groupSchoolId, schoolName, addressId, email, phoneNumber}= req.body
        const groupSchool = await GroupSchool.findById(groupSchoolId)
        const address = await Address.findById(addressId)
        if (!groupSchool && !address) return res.status(404).json({message: "GroupSchool or Address not found"})

        const school = new School({
            groupSchoolId,
            addressId,
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
        
        school.groupSchoolId= req.body.groupSchoolId
        school.addressId = req.body.addressId
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
        const school = await School.find({addressId: req.params.id}).populate('addressId', 'name')
        res.status(200).json(school)
    }catch(error){
        res.status(500).json({message: error.message})
    }
}