const GroupSchool = require('../model/GroupSchool')
const uploadToCloud = require('../helpers/uploadToCloud')
const fs = require('fs')

exports.getGroupSchools = async (req, res) => {
  try {
    const groupSchool = await GroupSchool.find()
    res.status(200).json(groupSchool)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getGroupSchool = async (req, res) => {
  try {
    const groupSchool = await GroupSchool.findById(req.params.id)
    if (!groupSchool)
      return res.status(404).json({ message: 'GroupSchool not found' })
    res.status(200).json(groupSchool)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.createGroupSchool = async (req, res) => {
  try {
    console.log('=== Creating Group School ===')
    console.log('Request body:', req.body)
    console.log('Request file:', req.file)

    const { name, description } = req.body

    // Validate required fields
    if (!name || !description) {
      console.log('Missing required fields:', {
        name: !!name,
        description: !!description,
      })
      return res.status(400).json({
        message: 'Name and description are required',
      })
    }

    // Check if group school with same name already exists
    const existingByName = await GroupSchool.findOne({ name })
    if (existingByName) {
      console.log('Group school with name already exists:', name)
      return res.status(409).json({
        message: 'A group school with this name already exists',
      })
    }

    let logoUrl = req.body.logo // Default to provided logo URL

    // If a file is uploaded, upload it to Cloudinary
    if (req.file) {
      console.log('File upload detected, uploading to Cloudinary...')
      try {
        // Generate public ID from school name
        const publicId = name.replace(/\s+/g, '_').toLowerCase()

        console.log('Uploading to Cloudinary with publicId:', publicId)
        // Upload to Cloudinary
        logoUrl = await uploadToCloud(
          req.file.path,
          'image',
          'School_logos',
          publicId
        )
        console.log('Cloudinary upload successful:', logoUrl)

        // Delete the local file after uploading to Cloudinary
        fs.unlinkSync(req.file.path)
        console.log('Local file deleted successfully')
      } catch (uploadError) {
        console.error('Cloudinary upload failed:', uploadError)
        // Clean up local file if upload fails
        if (req.file && req.file.path) {
          try {
            fs.unlinkSync(req.file.path)
          } catch (deleteError) {
            console.error('Error deleting local file:', deleteError)
          }
        }
        return res.status(500).json({
          message: 'Failed to upload logo to cloud storage',
          error: uploadError.message,
        })
      }
    }

    console.log('Final logoUrl:', logoUrl)

    // Validate that we have a logo URL
    if (!logoUrl) {
      console.log('No logo URL provided')
      return res.status(400).json({
        message:
          'Logo is required. Please provide either a logo file or logo URL',
      })
    }

    console.log('Creating group school with data:', {
      name,
      description,
      logoUrl,
    })

    // Create new group school
    const groupSchool = new GroupSchool({
      name,
      description,
      logo: logoUrl,
    })

    const newGroupSchool = await groupSchool.save()
    console.log('Group school created successfully:', newGroupSchool._id)

    res.status(201).json({
      success: true,
      message: 'Group school created successfully',
      data: newGroupSchool,
    })
  } catch (error) {
    console.error('Error in createGroupSchool:', error)
    console.error('Error stack:', error.stack)
    // Clean up local file if it exists and there's an error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path)
      } catch (deleteError) {
        console.error('Error deleting local file:', deleteError)
      }
    }

    console.error('Error creating group school:', error)
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
}

exports.updateGroupSchool = async (req, res) => {
  try {
    const { name, description } = req.body

    // Find the group school to update
    const groupSchool = await GroupSchool.findById(req.params.id)
    if (!groupSchool) {
      return res.status(404).json({ message: 'GroupSchool not found' })
    }

    // Check if name is being changed and if new name already exists
    if (name && name !== groupSchool.name) {
      const existingByName = await GroupSchool.findOne({
        name,
        _id: { $ne: req.params.id },
      })
      if (existingByName) {
        return res.status(409).json({
          message: 'A group school with this name already exists',
        })
      }
    }

    let logoUrl = req.body.logo || groupSchool.logo // Keep existing logo if no new one provided

    // If a file is uploaded, upload it to Cloudinary
    if (req.file) {
      try {
        // Generate public ID from school name (use new name if provided, otherwise existing)
        const schoolName = name || groupSchool.name
        const publicId = schoolName.replace(/\s+/g, '_').toLowerCase()

        // Upload to Cloudinary
        logoUrl = await uploadToCloud(
          req.file.path,
          'image',
          'School_logos',
          publicId
        )

        // Delete the local file after uploading to Cloudinary
        fs.unlinkSync(req.file.path)
      } catch (uploadError) {
        // Clean up local file if upload fails
        if (req.file && req.file.path) {
          try {
            fs.unlinkSync(req.file.path)
          } catch (deleteError) {
            console.error('Error deleting local file:', deleteError)
          }
        }
        return res.status(500).json({
          message: 'Failed to upload logo to cloud storage',
          error: uploadError.message,
        })
      }
    }

    // Check if logo URL is being changed and if new logo already exists
    if (logoUrl && logoUrl !== groupSchool.logo) {
      const existingByLogo = await GroupSchool.findOne({
        logo: logoUrl,
        _id: { $ne: req.params.id },
      })
      if (existingByLogo) {
        return res.status(409).json({
          message: 'This logo is already in use by another group school',
        })
      }
    }

    // Update the group school
    groupSchool.name = name || groupSchool.name
    groupSchool.description = description || groupSchool.description
    groupSchool.logo = logoUrl

    const updatedGroupSchool = await groupSchool.save()

    res.status(200).json({
      success: true,
      message: 'Group school updated successfully',
      data: updatedGroupSchool,
    })
  } catch (error) {
    // Clean up local file if it exists and there's an error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path)
      } catch (deleteError) {
        console.error('Error deleting local file:', deleteError)
      }
    }

    console.error('Error updating group school:', error)
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
}

exports.deleteGroupSchool = async (req, res) => {
  try {
    const groupSchool = await GroupSchool.findByIdAndDelete(req.params.id)
    if (!groupSchool)
      return res.status(404).json({ message: 'GroupSchool not found' })
    res.status(200).json({ message: 'GroupSchool deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.uploadSchoolLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }
    const groupSchool = await GroupSchool.findById(req.params.id)
    if (!groupSchool) {
      return res.status(404).json({ message: 'GroupSchool not found' })
    }
    const publicId = groupSchool.name.replace(/\s+/g, '_').toLowerCase()
    const logoUrl = await uploadToCloud(
      req.file.path,
      'image',
      'School_logos',
      publicId
    )
    groupSchool.logo = logoUrl
    // Delete the local file after uploading to Cloudinary
    fs.unlinkSync(req.file.path)
    await groupSchool.save()
    res.status(200).json({ message: 'Logo uploaded successfully' })
  } catch (error) {
    if (req.file) {
      // Delete the local file if it exists
      fs.unlinkSync(req.file.path).catch((err) => {
        console.error('Error deleting local file:', err)
      })
    }
    res.status(500).json({ message: error.message })
  }
}
