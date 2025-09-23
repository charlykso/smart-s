import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { ENV } from '../../constants';

const ConfigDebug: React.FC = () => {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Configuration Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div>
            <h4 className="font-medium mb-2">Environment Variables:</h4>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
{JSON.stringify({
  VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  DEV: import.meta.env.DEV,
  MODE: import.meta.env.MODE,
}, null, 2)}
            </pre>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">ENV Constants:</h4>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
{JSON.stringify({
  API_BASE_URL: ENV.API_BASE_URL,
  APP_NAME: ENV.APP_NAME,
  APP_ENVIRONMENT: ENV.APP_ENVIRONMENT,
}, null, 2)}
            </pre>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">API Service Test:</h4>
            <button 
              onClick={async () => {
                try {
                  const response = await fetch('/api/v1/health');
                  const data = await response.json();
                  alert('API Test Result: ' + JSON.stringify(data, null, 2));
                } catch (error) {
                  alert('API Test Error: ' + error.message);
                }
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Test /api/v1/health
            </button>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Current Location:</h4>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
{JSON.stringify({
  href: window.location.href,
  origin: window.location.origin,
  pathname: window.location.pathname,
}, null, 2)}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConfigDebug;
