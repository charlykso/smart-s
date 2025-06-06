// Simple test to check if email routes are working
const express = require('express');
const app = express();

app.use(express.json());

// Test if the email routes file can be loaded
try {
    const emailRoutes = require('./routes/emailRoutes');
    console.log('✅ Email routes loaded successfully');
    
    // Mount the routes
    app.use('/api/v1/email', emailRoutes);
    console.log('✅ Email routes mounted successfully');
    
    // Test route
    app.get('/test', (req, res) => {
        res.json({ message: 'Test route working' });
    });
    
    const server = app.listen(3001, () => {
        console.log('✅ Test server running on http://localhost:3001');
        console.log('📧 Email routes available at http://localhost:3001/api/v1/email/*');
        
        // Test the routes
        setTimeout(() => {
            const http = require('http');
            
            // Test basic route
            const req = http.get('http://localhost:3001/test', (res) => {
                console.log('✅ Basic test route working');
                server.close();
            });
            
            req.on('error', (err) => {
                console.log('❌ Test failed:', err.message);
                server.close();
            });
        }, 1000);
    });
    
} catch (error) {
    console.log('❌ Error loading email routes:', error.message);
    console.log('Stack trace:', error.stack);
}
