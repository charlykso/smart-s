import React, { useState } from 'react';
import { ApiService } from '../../services/api';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

const ApiTest: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testApiConnection = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing API connection...');
      console.log('API Base URL:', import.meta.env.VITE_BACKEND_URL);
      
      // Test health endpoint
      const healthResponse = await ApiService.get('/health');
      console.log('Health response:', healthResponse);
      
      // Test student login
      const loginResponse = await ApiService.post('/auth/login', {
        email: 'student@smart-s.com',
        password: 'password123'
      });
      console.log('Login response:', loginResponse);
      
      // Test student dashboard
      const dashboardResponse = await ApiService.get('/student/dashboard');
      console.log('Dashboard response:', dashboardResponse);
      
      setResult({
        health: healthResponse,
        login: loginResponse,
        dashboard: dashboardResponse
      });
    } catch (err: any) {
      console.error('API Test Error:', err);
      setError(err.message || 'API test failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>API Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Button onClick={testApiConnection} loading={loading}>
            Test API Connection
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive" title="Error" description={error} />
        )}
        
        {result && (
          <div className="space-y-4">
            <Alert variant="success" title="Success" description="API connection test completed successfully!" />
            
            <div className="grid gap-4">
              <div>
                <h4 className="font-medium mb-2">Health Check:</h4>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                  {JSON.stringify(result.health, null, 2)}
                </pre>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Login Response:</h4>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                  {JSON.stringify(result.login, null, 2)}
                </pre>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Dashboard Response:</h4>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                  {JSON.stringify(result.dashboard, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApiTest;
