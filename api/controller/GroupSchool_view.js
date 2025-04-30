const GroupSchool = require('../model/GroupSchool')


exports.getGroupSchools = async (req, res) =>{
    try{
        const groupSchool = await GroupSchool.find()
        res.status(200).json(groupSchool)
    }catch (error){
        res.status(500).json({message: error.message})
    }
}

exports.getGroupSchool = async (req, res) =>{
    try{
        const groupSchool = await GroupSchool.findById(req.params.id)
        if (!groupSchool) return res.status(404).json({message: 'GroupSchool not found'})
        res.status(200).json(groupSchool)
    } catch (error){
        res.status(500).json({message: error.message})
    }
}

exports.createGroupSchool = async (req, res) =>{
    const groupSchool = new GroupSchool({
        name: req.body.name,
        description: req.body.description,
        logo: req.body.logo,
    })
    try{
        const existing = await GroupSchool.findOne({ $or: [{name: req.body.name}, {logo: req.body.logo}] })
        if (existing) return res.status(409).json({message: 'This School already exists'})
        const newGroupSchool = await groupSchool.save()
        res.status(201).json(newGroupSchool)
    }catch (error){
        res.status(400).json({message: error.message})
    }
}

exports.updateGroupSchool = async (req, res) =>{
    try{
        const groupSchool = await GroupSchool.findByIdAndUpdate(req.params.id, req.body, {new: true})
        if (!groupSchool) return res.status(404).json({message: 'GroupSchool not found'})
        groupSchool.name = req.body.name
        groupSchool.description = req.body.description
        groupSchool.logo = req.body.logo
        const updatedGroupSchool = await groupSchool.save()
        res.status(200).json(updatedGroupSchool)
    }
    catch (error){
        res.status(400).json({message: error.message})
    }
}

exports.deleteGroupSchool = async (req, res) =>{
    try{
        const groupSchool = await GroupSchool.findByIdAndDelete(req.params.id)
        if (!groupSchool) return res.status(404).json({message: 'GroupSchool not found'})
        res.status(200).json({message: 'GroupSchool deleted successfully'})
    }catch (error){
        res.status(500).json({message: error.message})
    }
}
