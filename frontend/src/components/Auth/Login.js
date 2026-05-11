import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Login = ({ onSuccess, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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
          <label htmlFor="password" className="block text-green-300 text-sm font-medium mb-1">
            Password
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
