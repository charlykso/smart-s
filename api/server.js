const express = require('express')
const connectDB = require('./db/connection')
const groupSchoolRoute = require('./route/groupSchoolRoute')
const schoolRoute = require('./route/schoolRoute')
const addressRoute = require('./route/addressRoute')
const classArmRoute = require('./route/classArmRoute')
const userRoute = require('./route/userRoute')
const profileRoute = require('./route/profileRoute')
const sessionRoute = require('./route/sessionRoute')
const termRoute = require('./route/termRoute')
const paymentProfileRoute = require('./route/paymentProfileRoute')
const feeRoute = require('./route/feeRoute')
const authRoute = require('./route/authRoute')
const approveRoute = require('./route/approveRoute')

const app = express()

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
app.use('/api/v1/notifications', require('./route/notificationRoute'))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})
