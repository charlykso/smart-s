// Test script to simulate frontend authentication
const fetch = require('node-fetch');

const testFrontendAuth = async () => {
    try {
        console.log('Testing frontend authentication flow...');
        
        // Test login
        const loginResponse = await fetch('http://localhost:3000/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:3001'
            },
            credentials: 'include',
            body: JSON.stringify({
                email: 'admin@smart-s.com',
                password: 'password123'
            })
        });

        console.log('Login Response Status:', loginResponse.status);
        console.log('Login Response Headers:', Object.fromEntries(loginResponse.headers.entries()));
        
        const loginData = await loginResponse.json();
        console.log('Login Response Data:', JSON.stringify(loginData, null, 2));

        if (loginData.success) {
            console.log('✅ Login successful!');
            console.log('User:', loginData.data.user.firstname, loginData.data.user.lastname);
            console.log('Roles:', loginData.data.user.roles);
            console.log('Token received:', !!loginData.data.token);
        } else {
            console.log('❌ Login failed:', loginData.message);
        }

    } catch (error) {
        console.error('❌ Error testing authentication:', error.message);
    }
};

testFrontendAuth();
