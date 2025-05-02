const express = require('express');
const  connectDB = require('./db/connection')
const groupSchoolRoute = require('./route/groupSchoolRoute')
const schoolRoute = require('./route/schoolRoute')
const AddressRoute = require('./route/AddressRoute')
const ClassArmRoute = require('./route/ClassArmRoute')
const userRoute = require('./route/userRoute');
const profileRoute = require('./route/profileRoute');
const SessionRoute = require('./route/SessionRoute');
const TermRoute = require('./route/TermRoute');
const paymentProfileRoute = require('./route/paymentProfileRoute');
const feeRoute = require('./route/feeRoute')

const app = express();

connectDB(); // Connect to MongoDB
app.use(express.json()); // Middleware to parse JSON requests

//use the routes
app.use('/api/v1/groupSchool', groupSchoolRoute)
app.use('/api/v1/school', schoolRoute)
app.use('/api/v1/Address', AddressRoute)
app.use('/api/v1/ClassArm', ClassArmRoute)
app.use('/api/v1/user', userRoute)
app.use('/api/v1/profile', profileRoute)
app.use('/api/v1/Session', SessionRoute)
app.use('/api/v1/Term', TermRoute)
app.use('/api/v1/paymentProfile', paymentProfileRoute)
app.use('/api/v1/fee', feeRoute)

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
