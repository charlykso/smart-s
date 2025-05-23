const cloudinary  = require('cloudinary').v2;
const genTrxnRef = require('../helpers/genTrxnRef')
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
})
const uploadToCloud = async (filePath, fileType, folderName, publicId) => {
    try {
        
        const result = await cloudinary.uploader.upload(filePath, {
          resource_type: fileType,
          folder: 'Smart-s/' + folderName,
          public_id: publicId,
          notification_url: 'http://localhost:3000/api/v1/notifications/cloudinary',
          overwrite: true,
        })
        return result.secure_url;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw new Error('Failed to upload file to Cloudinary');
    }
}

module.exports = uploadToCloud;