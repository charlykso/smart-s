const User = require('./model/User')
const jwt = require('jsonwebtoken')
require('dotenv').config()

async function testICTAdminAuth() {
  console.log('🧪 Testing ICT Admin Authentication...')

  try {
    // Find an ICT Admin user
    const ictAdmin = await User.findOne({
      roles: 'ICT_administrator',
    }).populate('school')

    if (!ictAdmin) {
      console.log('❌ No ICT Admin found in database')
      return
    }

    console.log('✅ ICT Admin found:', {
      id: ictAdmin._id,
      email: ictAdmin.email,
      roles: ictAdmin.roles,
      school: ictAdmin.school?.name || 'No school assigned',
    })

    // Generate a token for this user
    const token = jwt.sign(
      {
        id: ictAdmin._id,
        roles: ictAdmin.roles,
        iat: Math.floor(Date.now() / 1000),
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '10h',
      }
    )

    console.log('✅ Generated token:', token.substring(0, 50) + '...')

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log('✅ Token verified:', {
      id: decoded.id,
      roles: decoded.roles,
      exp: new Date(decoded.exp * 1000),
    })

    // Test if we can find the user again
    const foundUser = await User.findById(decoded.id).populate('school')
    console.log('✅ User found from token:', {
      id: foundUser._id,
      email: foundUser.email,
      school: foundUser.school?.name,
    })
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testICTAdminAuth()
  .then(() => {
    console.log('🏁 Test completed')
    process.exit(0)
  })
  .catch(console.error)
