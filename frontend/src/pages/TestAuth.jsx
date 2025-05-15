import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const TestAuth = () => {
  const { token, user } = useAuth();
  const [publicResponse, setPublicResponse] = useState(null);
  const [protectedResponse, setProtectedResponse] = useState(null);
  const [adminResponse, setAdminResponse] = useState(null);
  const [error, setError] = useState(null);

  const testPublicRoute = async () => {
    try {
      const res = await axios.get('/api/test/public');
      setPublicResponse(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error testing public route');
    }
  };

  const testProtectedRoute = async () => {
    try {
      const res = await axios.get('/api/test/protected', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setProtectedResponse(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error testing protected route');
    }
  };

  const testAdminRoute = async () => {
    try {
      const res = await axios.get('/api/test/admin', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setAdminResponse(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error testing admin route');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Test</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Current User</h2>
          {user ? (
            <div className="bg-gray-100 p-3 rounded">
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
            </div>
          ) : (
            <p className="text-gray-600">Not logged in</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div>
            <button 
              onClick={testPublicRoute}
              className="btn btn-primary w-full mb-2"
            >
              Test Public Route
            </button>
            {publicResponse && (
              <div className="bg-green-100 p-2 rounded text-sm">
                <pre>{JSON.stringify(publicResponse, null, 2)}</pre>
              </div>
            )}
          </div>
          
          <div>
            <button 
              onClick={testProtectedRoute}
              className="btn btn-primary w-full mb-2"
              disabled={!token}
            >
              Test Protected Route
            </button>
            {protectedResponse && (
              <div className="bg-green-100 p-2 rounded text-sm">
                <pre>{JSON.stringify(protectedResponse, null, 2)}</pre>
              </div>
            )}
          </div>
          
          <div>
            <button 
              onClick={testAdminRoute}
              className="btn btn-primary w-full mb-2"
              disabled={!token || user?.role !== 'admin'}
            >
              Test Admin Route
            </button>
            {adminResponse && (
              <div className="bg-green-100 p-2 rounded text-sm">
                <pre>{JSON.stringify(adminResponse, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAuth;
