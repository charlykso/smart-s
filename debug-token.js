const jwt = require('jsonwebtoken')
require('dotenv').config()

// Test token from the login response
const testToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NWMzNWZjMjRkZjAyNzczZTg5NTg4YSIsInJvbGVzIjpbIlByaW5jaXBhbCJdLCJpYXQiOjE3NTEzNzA5MTAsImV4cCI6MTc1MTQwNjkxMH0.V0Hacx6qsVvaCKUsQIg_pDKfJ-iY8hgOdf98URmQbUAY'

console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET)
console.log('JWT_SECRET:', process.env.JWT_SECRET)

try {
  const decoded = jwt.verify(testToken, process.env.JWT_SECRET)
  console.log('✅ Token is valid!')
  console.log('Decoded payload:', decoded)
} catch (error) {
  console.log('❌ Token verification failed:', error.message)

  // Check if token is expired
  try {
    const decoded = jwt.decode(testToken)
    console.log('Token payload (no verification):', decoded)
    console.log('Token expires at:', new Date(decoded.exp * 1000))
    console.log('Current time:', new Date())
    console.log('Is expired:', decoded.exp * 1000 < Date.now())
  } catch (decodeError) {
    console.log('❌ Failed to decode token:', decodeError.message)
  }
}
