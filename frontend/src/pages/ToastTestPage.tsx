import React from 'react';
import { showToast } from '../utils/toast';

const ToastTestPage: React.FC = () => {
  const testSuccessToast = () => {
    showToast.success('Payment processed successfully!');
  };

  const testErrorToast = () => {
    showToast.error('Payment failed. Please try again.');
  };

  const testInfoToast = () => {
    showToast.info('This is an information message.');
  };

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold mb-6">Toast Styling Test</h1>
      
      <div className="space-y-4">
        <button
          onClick={testSuccessToast}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Test Success Toast
        </button>
        
        <button
          onClick={testErrorToast}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Test Error Toast
        </button>
        
        <button
          onClick={testInfoToast}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Test Info Toast
        </button>
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded-md">
        <h2 className="font-semibold mb-2">Expected Results:</h2>
        <ul className="text-sm space-y-1">
          <li>✅ Success: Green background with checkmark icon</li>
          <li>❌ Error: Red background with X icon</li>
          <li>ℹ️ Info: Blue background with info icon</li>
        </ul>
      </div>
    </div>
  );
};

export default ToastTestPage;
