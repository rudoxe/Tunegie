import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { API_BASE } = useAuth();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setErrors({ token: 'Invalid or missing reset token' });
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setErrors({ token: 'Invalid or missing reset token' });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/reset-password.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token: token,
          password: formData.password 
        }),
      });

      const data = await response.json();
      
      if (response.ok && !data.error) {
        setSuccess(true);
        setErrors({});
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        setErrors({ submit: data.error || 'Failed to reset password' });
      }
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${theme.background} flex items-center justify-center p-4`}>
        <div className="max-w-md mx-auto bg-black/70 rounded-lg p-6 border border-green-500/30 text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 text-green-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-400 mb-4">Password Reset Successful!</h2>
          <p className="text-green-200 text-sm mb-4">
            Your password has been reset successfully. You will be redirected to the login page in a few seconds.
          </p>
          <button
            onClick={() => navigate('/')}
            className="text-green-400 hover:text-green-300 underline font-medium"
          >
            Go to Login Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.background} flex items-center justify-center p-4`}>
      <div className="max-w-md mx-auto bg-black/70 rounded-lg p-6 border border-green-500/30">
        <h2 className="text-2xl font-bold text-green-400 text-center mb-6">Reset Your Password</h2>
        
        {errors.token && (
          <div className="bg-red-600/20 border border-red-500/50 rounded p-3 mb-4">
            <p className="text-red-300 text-sm">{errors.token}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.submit && (
            <div className="bg-red-600/20 border border-red-500/50 rounded p-3">
              <p className="text-red-300 text-sm">{errors.submit}</p>
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-green-300 text-sm font-medium mb-1">
              New Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-gray-800 border rounded-md text-white focus:outline-none focus:ring-2 ${
                errors.password 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-600 focus:ring-green-500 focus:border-green-500'
              }`}
              placeholder="Enter your new password"
            />
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-green-300 text-sm font-medium mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-gray-800 border rounded-md text-white focus:outline-none focus:ring-2 ${
                errors.confirmPassword 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-600 focus:ring-green-500 focus:border-green-500'
              }`}
              placeholder="Confirm your new password"
            />
            {errors.confirmPassword && (
              <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
              loading || !token
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-green-400 hover:text-green-300 underline font-medium text-sm"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
