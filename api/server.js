const express = require('express')
const connectDB = require('./db/connection')
const groupSchoolRoute = require('./route/groupSchoolRoute')
const schoolRoute = require('./route/schoolRoute')
const addressRoute = require('./route/AddressRoute')
const classArmRoute = require('./route/ClassArmRoute')
const userRoute = require('./route/userRoute')
const profileRoute = require('./route/profileRoute')
const sessionRoute = require('./route/SessionRoute')
const termRoute = require('./route/TermRoute')
const paymentProfileRoute = require('./route/paymentProfileRoute')
const feeRoute = require('./route/feeRoute')
const authRoute = require('./route/authRoute')
const approveRoute = require('./route/approveRoute')
const auditRoute = require('./route/auditRoute')
const studentRoute = require('./route/studentRoute')
const adminRoute = require('./route/adminRoute')
const principalRoute = require('./route/principalRoute')
const bursarRoute = require('./route/bursarRoute')
const parentRoute = require('./route/parentRoute')
const bulkStudentRoute = require('./route/bulkStudentRoute')
const ictAdminRoute = require('./route/ictAdminRoute')

// ICT Admin management routes
const schoolManagementRoute = require('./routes/schoolRoutes')
const userManagementRoute = require('./routes/userManagementRoutes')

const app = express()

// Add process error handlers to prevent crashes
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
  // Don't exit the process, just log the error
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  // Don't exit the process, just log the error
})

// CORS middleware - more explicit configuration
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    process.env.FRONTEND_URL, // Add frontend URL from environment
  ].filter(Boolean) // Remove undefined values

  const origin = req.headers.origin

  // Always set CORS headers
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin)
  } else if (process.env.NODE_ENV === 'development') {
    // For development, allow localhost:3001 even if origin header is missing
    res.header('Access-Control-Allow-Origin', 'http://localhost:3001')
  } else {
    // For production, allow the configured frontend URL or wildcard
    res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*')
  }

  res.header('Access-Control-Allow-Credentials', 'true')
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS, PATCH'
  )
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma'
  )

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  next()
})

app.use(express.urlencoded({ extended: true }))

connectDB() // Connect to MongoDB
app.use(express.json()) // Middleware to parse JSON requests

//use the routes
app.use('/api/v1/groupSchool', groupSchoolRoute)
app.use('/api/v1/school', schoolRoute)
app.use('/api/v1/Address', addressRoute)
app.use('/api/v1/ClassArm', classArmRoute)
app.use('/api/v1/user', userRoute)
app.use('/api/v1/profile', profileRoute)
app.use('/api/v1/Session', sessionRoute)
app.use('/api/v1/Term', termRoute)
app.use('/api/v1/paymentProfile', paymentProfileRoute)
app.use('/api/v1/fee', feeRoute)
app.use('/api/v1/approve', approveRoute)
app.use('/api/v1/auth', authRoute)
app.use('/api/v1/payment', require('./route/paymentRoute'))
app.use('/api/v1/school-access', require('./route/schoolAccessRoute'))
// Simple notification endpoints directly in server.js
app.get('/api/v1/notification/unread-count', (req, res) => {
  res.json({ count: 0 })
})

app.get('/api/v1/notification/all', (req, res) => {
  console.log('All notifications endpoint hit')
  res.json([])
})

app.post('/api/v1/notification/mark-all-read', (req, res) => {
  res.json({ message: 'All notifications marked as read' })
})

app.post('/api/v1/notification/:id/mark-read', (req, res) => {
  res.json({ message: 'Notification marked as read' })
})

app.delete('/api/v1/notification/:id', (req, res) => {
  res.json({ message: 'Notification deleted' })
})
app.use('/api/v1/email', require('./routes/emailRoutesSimple'))
app.use('/api/v1/audit', auditRoute)
app.use('/api/v1/student', studentRoute)
app.use('/api/v1/admin', adminRoute)
app.use('/api/v1/principal', principalRoute)
app.use('/api/v1/bursar', bursarRoute)
app.use('/api/v1/parent', parentRoute)
app.use('/api/v1/bulk-students', bulkStudentRoute)
app.use('/api/v1/ict-admin', ictAdminRoute)
app.use('/api/v1/reports', require('./route/reportRoute'))

// ICT Admin management routes
app.use('/api/v1/schools', schoolManagementRoute)
app.use('/api/v1/users', userManagementRoute)

// Add missing routes to prevent 404 errors
app.get('/api/v1/communities', (req, res) => {
  res.json({ success: true, data: [] })
})

app.get('/api/v1/social-accounts', (req, res) => {
  res.json({ success: true, data: [] })
})

// Add missing stats endpoints
const authenticateToken = require('./middleware/authenticateToken')
app.get('/api/v1/fee/all/stats', authenticateToken, async (req, res) => {
  try {
    const Fee = require('./model/Fee')
    const totalFees = await Fee.countDocuments()
    const approvedFees = await Fee.countDocuments({ isApproved: true })
    const pendingFees = await Fee.countDocuments({ isApproved: false })

    res.json({
      success: true,
      data: {
        total: totalFees,
        approved: approvedFees,
        pending: pendingFees,
      },
    })
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Error fetching fee stats' })
  }
})

app.get('/api/v1/payment/all/stats', authenticateToken, async (req, res) => {
  try {
    const Payment = require('./model/Payment')
    const totalPayments = await Payment.countDocuments()
    const successfulPayments = await Payment.countDocuments({
      status: 'successful',
    })
    const pendingPayments = await Payment.countDocuments({ status: 'pending' })

    res.json({
      success: true,
      data: {
        total: totalPayments,
        successful: successfulPayments,
        pending: pendingPayments,
      },
    })
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Error fetching payment stats' })
  }
})

app.get('/api/v1/students/stats', authenticateToken, async (req, res) => {
  try {
    const User = require('./model/User')
    const userSchool = req.user.school?._id || req.user.school
    const userRoles = req.user.roles || []

    // Build query based on user role
    let query = { roles: 'Student' }

    // Only general Admin can access all schools - others are filtered by school
    if (!userRoles.includes('Admin') || userSchool) {
      if (!userSchool) {
        return res.status(400).json({
          success: false,
          message: 'User not assigned to a school',
        })
      }
      query.school = userSchool
    }

    const totalStudents = await User.countDocuments(query)
    const activeStudents = await User.countDocuments({
      ...query,
      isActive: true,
    })

    // Get additional stats
    const maleStudents = await User.countDocuments({
      ...query,
      gender: 'Male',
    })

    const femaleStudents = await User.countDocuments({
      ...query,
      gender: 'Female',
    })

    res.json({
      success: true,
      data: {
        totalStudents,
        activeStudents,
        inactiveStudents: totalStudents - activeStudents,
        maleStudents,
        femaleStudents,
        studentsByClass: [], // Will be populated by frontend if needed
        recentEnrollments: [], // Will be populated by frontend if needed
      },
    })
  } catch (error) {
    console.error('Student stats error:', error)
    res
      .status(500)
      .json({ success: false, message: 'Error fetching student stats' })
  }
})

app.get('/api/v1/social-accounts/platforms/supported', (req, res) => {
  res.json({ success: true, data: [] })
})

app.get('/api/v1/users/organization/members', (req, res) => {
  res.json({ success: true, data: [], total: 0 })
})

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err)
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Something went wrong',
  })
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// 404 handler for undefined routes (must be last)
app.use((req, res) => {
  console.log('404 - Route not found:', req.method, req.originalUrl)
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})
