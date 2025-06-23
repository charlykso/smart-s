const http = require('http')
require('dotenv').config()

const BASE_URL = 'localhost'
const API_PATH = '/api/v1'

// Helper function to make HTTP requests
function makeRequest(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null

    const options = {
      hostname: BASE_URL,
      port: 3000,
      path: `${API_PATH}${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData)
    }

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`
    }

    const req = http.request(options, (res) => {
      let responseData = ''

      res.on('data', (chunk) => {
        responseData += chunk
      })

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData)
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed)
          } else {
            reject({
              status: res.statusCode,
              message: parsed.message || 'Request failed',
              data: parsed,
            })
          }
        } catch (error) {
          reject({
            status: res.statusCode,
            message: 'Invalid JSON response',
            data: responseData,
          })
        }
      })
    })

    req.on('error', (error) => {
      reject({ message: error.message })
    })

    req.setTimeout(10000, () => {
      req.destroy()
      reject({ message: 'Request timeout' })
    })

    if (postData) {
      req.write(postData)
    }

    req.end()
  })
}

async function createICTAdminSetup() {
  try {
    console.log('Creating ICT Admin setup...\n')

    // Step 1: Login as Admin
    console.log('Step 1: Logging in as Admin...')
    const loginResponse = await makeRequest('/auth/login', 'POST', {
      email: 'admin@ledgrio.com',
      password: 'password123',
    })

    const adminToken = loginResponse.data.token
    console.log('Admin login successful!')

    // Step 2: Check existing group schools
    console.log('\nStep 2: Checking existing Group Schools...')
    let groupSchoolId

    try {
      const groupSchoolsResponse = await makeRequest(
        '/groupSchool/all',
        'GET',
        null,
        adminToken
      )

      if (
        groupSchoolsResponse.groupSchools &&
        groupSchoolsResponse.groupSchools.length > 0
      ) {
        const greenwood = groupSchoolsResponse.groupSchools.find((gs) =>
          gs.name.toLowerCase().includes('greenwood')
        )

        if (greenwood) {
          groupSchoolId = greenwood._id
          console.log('Using existing Group School:', greenwood.name)
        } else {
          groupSchoolId = groupSchoolsResponse.groupSchools[0]._id
          console.log(
            'Using first available Group School:',
            groupSchoolsResponse.groupSchools[0].name
          )
        }
      } else {
        console.log('No existing group schools found, creating new one...')

        const groupSchoolData = {
          name: 'Greenwood Educational Group',
          description:
            'A leading educational group providing quality education',
          logo: 'https://via.placeholder.com/200x200.png?text=Greenwood',
        }

        const newGroupSchoolResponse = await makeRequest(
          '/groupSchool/create',
          'POST',
          groupSchoolData,
          adminToken
        )
        groupSchoolId = newGroupSchoolResponse.groupSchool._id
        console.log(
          'Group School created:',
          newGroupSchoolResponse.groupSchool.name
        )
      }
    } catch (error) {
      console.log('Error with group schools:', error.message)
      throw error
    }

    // Step 3: Check existing schools
    console.log('\nStep 3: Checking existing schools...')
    let schoolId

    try {
      const schoolsResponse = await makeRequest(
        '/school/all',
        'GET',
        null,
        adminToken
      )

      if (schoolsResponse.schools && schoolsResponse.schools.length > 0) {
        const greenwoodSchool = schoolsResponse.schools.find((school) =>
          school.name.toLowerCase().includes('greenwood')
        )

        if (greenwoodSchool) {
          schoolId = greenwoodSchool._id
          console.log('Using existing school:', greenwoodSchool.name)
        } else {
          schoolId = schoolsResponse.schools[0]._id
          console.log(
            'Using first available school:',
            schoolsResponse.schools[0].name
          )
        }
      } else {
        console.log('No existing schools found, creating new one...')

        const schoolData = {
          name: 'Greenwood High School',
          email: 'contact@greenwood.edu',
          phoneNumber: '+1234567890',
          address: '123 Education Street, Learning City',
          groupSchool: groupSchoolId,
          isActive: true,
        }

        const newSchoolResponse = await makeRequest(
          '/school/create',
          'POST',
          schoolData,
          adminToken
        )
        schoolId = newSchoolResponse.school._id
        console.log('School created:', newSchoolResponse.school.name)
      }
    } catch (error) {
      console.log('Error with schools:', error.message)
      throw error
    }

    // Step 4: Create ICT Admin user
    console.log('\nStep 4: Creating ICT Admin user...')
    const ictAdminData = {
      firstname: 'ICT',
      lastname: 'Administrator',
      email: 'ict@greenwood.edu',
      password: 'password123',
      roles: ['ICT_administrator'],
      status: 'active',
      isActive: true,
      school: schoolId,
    }

    try {
      const ictAdminResponse = await makeRequest(
        '/user/create',
        'POST',
        ictAdminData,
        adminToken
      )
      console.log('ICT Admin created:', ictAdminResponse.user.email)
    } catch (error) {
      if (error.status === 409) {
        console.log('ICT Admin user already exists')
      } else {
        console.log('ICT Admin creation error:', error.message)
        throw error
      }
    }

    // Step 5: Test ICT Admin login
    console.log('\nStep 5: Testing ICT Admin login...')
    try {
      const ictLoginResponse = await makeRequest('/auth/login', 'POST', {
        email: 'ict@greenwood.edu',
        password: 'password123',
      })

      console.log('ICT Admin login successful!')
      console.log('ICT Admin user:', {
        id: ictLoginResponse.data.user._id,
        email: ictLoginResponse.data.user.email,
        roles: ictLoginResponse.data.user.roles,
        school: ictLoginResponse.data.user.school,
      })

      console.log('\n✅ ICT Admin setup completed successfully!')
      console.log('\nCredentials:')
      console.log('Email: ict@greenwood.edu')
      console.log('Password: password123')
    } catch (error) {
      console.log('ICT Admin login failed:', error.message)
      throw error
    }
  } catch (error) {
    console.error('\n❌ Setup failed:')
    console.error('Error:', error.message)
    if (error.data) {
      console.error('Details:', error.data)
    }
  }
}

createICTAdminSetup()
