const express = require('express');
const  connectDB = require('./db/connection')
const groupSchoolRoute = require('./route/groupSchoolRoute')
const schoolRoute = require('./route/schoolRoute')
const AddressRoute = require('./route/AddressRoute')
const ClassArmRoute = require('./route/ClassArmRoute')
const userRoute = require('./route/userRoute');
const profileRoute = require('./route/profileRoute');
<<<<<<< HEAD
const paymentProfileRoute = require('./route/paymentProfileRoute');
=======
const feeRoute = require('./route/feeRoute')
>>>>>>> e8d0664 (Fee model added)

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
<<<<<<< HEAD
app.use('/api/v1/paymentProfile', paymentProfileRoute)
=======
app.use('/api/v1/fee', feeRoute)
>>>>>>> e8d0664 (Fee model added)

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
