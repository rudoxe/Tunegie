import React, { useState } from 'react';
import tidalApiService from '../services/tidalApi';

export default function ApiTest() {
  const [testResult, setTestResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testApiConnection = async () => {
    setIsLoading(true);
    setTestResult('Testing TIDAL API connection...');

    try {
      // Initialize SDK
      await tidalApiService.initialize();
      console.log('SDK initialized');
      
      // Test API call
      const connected = await tidalApiService.testConnection();
      
      if (connected) {
        // Try to get some sample tracks
        const tracks = await tidalApiService.searchTracks('pop', 5);
        setTestResult(`✅ Success! Found ${tracks.items?.length || 0} tracks. Check console for details.`);
        console.log('Sample tracks:', tracks);
      } else {
        setTestResult('❌ Connection test failed');
      }
    } catch (error) {
      console.error('API test failed:', error);
      setTestResult(`❌ Error: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="bg-gray-900/30 rounded-xl p-6 mb-8">
      <h3 className="text-xl font-semibold text-green-400 mb-4">TIDAL API Test</h3>
      <button
        onClick={testApiConnection}
        disabled={isLoading}
        className="bg-green-600 text-black px-4 py-2 rounded-lg font-semibold hover:bg-green-500 transition disabled:opacity-50"
      >
        {isLoading ? 'Testing...' : 'Test API Connection'}
      </button>
      {testResult && (
        <div className="mt-4 p-4 bg-black/50 rounded-lg">
          <p className="text-green-200">{testResult}</p>
        </div>
      )}
    </div>
  );
}
