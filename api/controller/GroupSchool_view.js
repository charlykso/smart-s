const GroupSchool = require('../model/GroupSchool')
const uploadToCloud = require('../helpers/uploadToCloud')
const fs = require('fs')


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

exports.uploadSchoolLogo = async (req, res) => {
    try {
        
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const groupSchool = await GroupSchool.findById(req.params.id);
        if (!groupSchool) {
            return res.status(404).json({ message: 'GroupSchool not found' });
        }
        const publicId = groupSchool.name.replace(/\s+/g, '_').toLowerCase();
        const logoUrl = await uploadToCloud(req.file.path, 'image', 'School_logos', publicId);
        groupSchool.logo = logoUrl;
        // Delete the local file after uploading to Cloudinary
        fs.unlinkSync(req.file.path);
        await groupSchool.save();
        res.status(200).json({ message: 'Logo uploaded successfully' });
    } catch (error) {
        if (req.file) {
            // Delete the local file if it exists
            fs.unlinkSync(req.file.path).catch(err => {
                console.error('Error deleting local file:', err);
            });
        }
        res.status(500).json({ message: error.message });
    }
}
