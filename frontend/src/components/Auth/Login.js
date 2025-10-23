import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Login = ({ onSuccess, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  const { login } = useAuth();

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

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        console.log('Login successful:', result.user);
        if (onSuccess) {
          onSuccess(result.user);
        }
      } else {
        setErrors({ submit: result.error });
      }
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail) {
      setErrors({ forgotPassword: 'Email is required' });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(forgotPasswordEmail)) {
      setErrors({ forgotPassword: 'Please enter a valid email' });
      return;
    }

    setForgotPasswordLoading(true);
    setErrors({});

    try {
      const apiBase = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8000/api';
      const response = await fetch(`${apiBase}/forgot-password.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      const data = await response.json();
      
      if (response.ok && !data.error) {
        // Show the reset URL directly
        if (data.reset_url) {
          console.log('Password reset URL:', data.reset_url);
          
          setForgotPasswordMessage(
            <div>
              <div className="bg-green-600/20 border border-green-500/50 rounded p-4 mb-4">
                <p className="text-green-300 text-sm font-bold mb-2">✅ {data.message}</p>
                {data.username && (
                  <p className="text-green-200 text-xs mb-3">
                    Hello <strong>{data.username}</strong>! {data.instructions}
                  </p>
                )}
              </div>
              
              <div className="bg-blue-600/20 border border-blue-500/50 rounded p-4">
                <p className="text-blue-300 text-sm font-bold mb-2">🔗 Your Password Reset Link:</p>
                <div className="bg-gray-800 border border-gray-600 rounded p-3 mb-3">
                  <input 
                    type="text" 
                    value={data.reset_url} 
                    readOnly 
                    className="w-full bg-transparent text-white text-xs font-mono border-none outline-none"
                    onClick={(e) => e.target.select()}
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(data.reset_url);
                      alert('Link copied to clipboard!');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors"
                  >
                    📋 Copy Link
                  </button>
                  
                  <a
                    href={data.reset_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm text-center transition-colors"
                  >
                    🚀 Open Reset Page
                  </a>
                </div>
                
                <p className="text-blue-200 text-xs mt-3">
                  ⏰ This link expires in {data.expires_in || '1 hour'}
                </p>
                
                {process.env.NODE_ENV === 'development' && (
                  <p className="text-blue-200 text-xs mt-2">
                    💡 Alternative: <a href={`${apiBase}/dev-reset-links.php`} target="_blank" rel="noreferrer" className="underline text-blue-400">View all reset links</a>
                  </p>
                )}
              </div>
            </div>
          );
          return;
        } else {
          setForgotPasswordMessage(data.message);
        }
      } else {
        setErrors({ forgotPassword: data.error || 'Failed to send reset email' });
      }
    } catch (error) {
      setErrors({ forgotPassword: 'An unexpected error occurred. Please try again.' });
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const resetForgotPasswordForm = () => {
    setShowForgotPassword(false);
    setForgotPasswordEmail('');
    setForgotPasswordMessage('');
    setErrors({});
  };

  if (showForgotPassword) {
    return (
      <div className="max-w-md mx-auto bg-black/70 rounded-lg p-6 border border-green-500/30">
        <h2 className="text-2xl font-bold text-green-400 text-center mb-6">Forgot Password</h2>
        
        {forgotPasswordMessage ? (
          <div className="text-center">
            <div className="bg-green-600/20 border border-green-500/50 rounded p-3 mb-4">
              <p className="text-green-300 text-sm">{forgotPasswordMessage}</p>
            </div>
            <button
              onClick={resetForgotPasswordForm}
              className="text-green-400 hover:text-green-300 underline font-medium"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <>
            <p className="text-green-200 text-sm mb-4 text-center">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            <form onSubmit={handleForgotPassword} className="space-y-4">
              {errors.forgotPassword && (
                <div className="bg-red-600/20 border border-red-500/50 rounded p-3">
                  <p className="text-red-300 text-sm">{errors.forgotPassword}</p>
                </div>
              )}

              <div>
                <label htmlFor="forgotEmail" className="block text-green-300 text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="forgotEmail"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className={`w-full px-3 py-2 bg-gray-800 border rounded-md text-white focus:outline-none focus:ring-2 ${
                    errors.forgotPassword 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-600 focus:ring-green-500 focus:border-green-500'
                  }`}
                  placeholder="Enter your email"
                />
              </div>

              <button
                type="submit"
                disabled={forgotPasswordLoading}
                className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                  forgotPasswordLoading
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {forgotPasswordLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={resetForgotPasswordForm}
                className="text-green-400 hover:text-green-300 underline font-medium text-sm"
              >
                Back to Login
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-black/70 rounded-lg p-6 border border-green-500/30">
      <h2 className="text-2xl font-bold text-green-400 text-center mb-6">Welcome Back!</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.submit && (
          <div className="bg-red-600/20 border border-red-500/50 rounded p-3">
            <p className="text-red-300 text-sm">{errors.submit}</p>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-green-300 text-sm font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 bg-gray-800 border rounded-md text-white focus:outline-none focus:ring-2 ${
              errors.email 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-600 focus:ring-green-500 focus:border-green-500'
            }`}
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="text-red-400 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="password" className="block text-green-300 text-sm font-medium">
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-green-400 hover:text-green-300 text-xs underline"
            >
              Forgot password?
            </button>
          </div>
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
            placeholder="Enter your password"
          />
          {errors.password && (
            <p className="text-red-400 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
            loading
              ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-green-200 text-sm">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-green-400 hover:text-green-300 underline font-medium"
          >
            Sign up here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;


