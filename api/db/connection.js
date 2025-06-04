const mongoose = require('mongoose')
const dotenv = require('dotenv')
require('dotenv').config()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB connected successfully...')
  } catch (err) {
    console.error('MongoDB connection failed:', err.message)
    console.log('Continuing without MongoDB connection...')
    // Don't exit the process, just log the error
  }
}

module.exports = connectDB
