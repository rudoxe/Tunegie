import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeSelector from './ThemeSelector';

const Profile = () => {
  const { user, token, updateUser } = useAuth();
  const { theme } = useTheme();
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    profile_picture: '',
    created_at: ''
  });
  const [formData, setFormData] = useState({
    username: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [usernameHistory, setUsernameHistory] = useState([]);
  const [showUsernameHistory, setShowUsernameHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, token]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProfile = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/profile.php', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok && !data.error) {
        setProfile(data.user);
        setFormData({
          username: data.user.username
        });
      } else {
        setErrors({ fetch: data.error });
      }
    } catch (error) {
      setErrors({ fetch: 'Failed to load profile data' });
    }
  };

  const handleInputChange = (e) => {
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

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 8 || formData.username.length > 16) {
      newErrors.username = 'Username must be 8-16 characters long';
    } else if (!/^[a-zA-Z]+$/.test(formData.username)) {
      newErrors.username = 'Username must contain only Latin letters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchUsernameHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/username-history.php', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok && !data.error) {
        setUsernameHistory(data.history || []);
      } else {
        console.error('Failed to fetch username history:', data.error);
      }
    } catch (error) {
      console.error('Failed to fetch username history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:8000/api/profile.php', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (response.ok && !data.error) {
        setProfile(data.user);
        // Update the user in AuthContext
        updateUser({ username: data.user.username });
        setMessage('Profile updated successfully!');
        setErrors({});
        // Refresh username history if it was being displayed
        if (showUsernameHistory) {
          fetchUsernameHistory();
        }
      } else {
        setErrors({ submit: data.error });
      }
    } catch (error) {
      setErrors({ submit: 'An error occurred while updating profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setErrors({ upload: 'File format or size is not correct!' });
      return;
    }

    // Validate file size (6MB max)
    if (file.size > 6 * 1024 * 1024) {
      setErrors({ upload: 'File format or size is not correct!' });
      return;
    }

    setUploadLoading(true);
    setErrors({ upload: '' });

    const formDataFile = new FormData();
    formDataFile.append('profile_picture', file);

    try {
      const response = await fetch('http://localhost:8000/api/upload_profile_picture.php', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData - browser will set it automatically with boundary
        },
        body: formDataFile
      });

      const data = await response.json();
      
      if (response.ok && !data.error) {
        setProfile(prev => ({
          ...prev,
          profile_picture: data.profile_picture
        }));
        // Update the user in AuthContext
        updateUser({ profile_picture: data.profile_picture });
        setMessage('Profile successfully saved!');
      } else {
        setErrors({ upload: data.error });
      }
    } catch (error) {
      setErrors({ upload: 'Failed to upload profile picture' });
    } finally {
      setUploadLoading(false);
    }
  };

  if (!user) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${theme.background} flex items-center justify-center p-4 transition-all duration-500`}>
        <div className="text-center text-white animate-fade-in">
          <p className="text-xl">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.background} p-4 transition-all duration-500`}>
      <div className="max-w-4xl mx-auto">
        <h1 className={`text-3xl font-bold text-${theme.text} text-center mb-8 animate-fade-in`}>Your Profile</h1>
        
        {message && (
          <div className={`bg-${theme.primary}/20 border border-${theme.primary}/50 rounded p-3 mb-6 animate-slide-in`}>
            <p className={`text-${theme.text} text-sm`}>{message}</p>
          </div>
        )}

        <div className={`bg-${theme.surface} rounded-lg p-6 border border-${theme.surfaceBorder} mb-6 transition-all duration-300 hover:${theme.glow}/20`}>
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center">
              <div className="relative group">
                {profile.profile_picture ? (
                  <img
                    src={`http://localhost:8000/${profile.profile_picture}`}
                    alt="Profile"
                    className={`w-24 h-24 rounded-full object-cover border-2 border-${theme.primary} transition-all duration-300 group-hover:scale-110 group-hover:${theme.glow}`}
                  />
                ) : (
                  <div className={`w-24 h-24 rounded-full bg-gray-700 border-2 border-${theme.primary} flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:${theme.glow}`}>
                    <svg className={`w-12 h-12 text-${theme.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                {uploadLoading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className={`w-6 h-6 border-2 border-${theme.primary} border-t-transparent rounded-full animate-spin`}></div>
                  </div>
                )}
              </div>
              
              <label className={`mt-2 cursor-pointer bg-${theme.primary} hover:bg-${theme.primaryHover} text-white px-3 py-1 rounded text-sm transition-all duration-200 hover:scale-105 hover:${theme.glow}`}>
                Change Photo
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploadLoading}
                />
              </label>
              
              {errors.upload && (
                <p className="text-red-400 text-xs mt-1 text-center">{errors.upload}</p>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className={`text-xl font-semibold text-${theme.text} animate-slide-in`}>{profile.username}</h2>
              <p className={`text-${theme.textSecondary} animate-slide-in`}>{profile.email}</p>
              <p className={`text-${theme.textMuted} text-sm animate-slide-in`}>
                Member since: {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Theme Selector Section */}
        <div className="mb-6">
          <ThemeSelector />
        </div>

        {/* Edit Profile Form */}
        <div className={`bg-${theme.surface} rounded-lg p-6 border border-${theme.surfaceBorder} transition-all duration-300`}>
          <h3 className={`text-xl font-semibold text-${theme.text} mb-4`}>Edit Profile</h3>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {errors.submit && (
              <div className="bg-red-600/20 border border-red-500/50 rounded p-3 animate-slide-in">
                <p className="text-red-300 text-sm">{errors.submit}</p>
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="username" className={`block text-${theme.textSecondary} text-sm font-medium`}>
                  Username
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (!showUsernameHistory) {
                      fetchUsernameHistory();
                    }
                    setShowUsernameHistory(!showUsernameHistory);
                  }}
                  className={`text-${theme.primary} hover:text-${theme.primaryHover} text-xs underline transition-colors duration-200`}
                >
                  {showUsernameHistory ? 'Hide History' : 'View History'}
                </button>
              </div>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 bg-gray-800 border rounded-md text-white focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.username 
                    ? 'border-red-500 focus:ring-red-500' 
                    : `border-gray-600 focus:ring-${theme.ring} focus:border-${theme.primary}`
                }`}
                placeholder="Your username"
              />
              {errors.username && (
                <p className="text-red-400 text-xs mt-1 animate-slide-in">{errors.username}</p>
              )}
              
              {showUsernameHistory && (
                <div className={`mt-3 p-3 bg-${theme.surfaceBorder}/10 border border-${theme.surfaceBorder} rounded-md`}>
                  <h4 className={`text-${theme.textSecondary} text-sm font-medium mb-2`}>Username History</h4>
                  {historyLoading ? (
                    <div className="flex items-center justify-center py-2">
                      <div className={`w-4 h-4 border-2 border-${theme.primary} border-t-transparent rounded-full animate-spin mr-2`}></div>
                      <span className={`text-${theme.textMuted} text-xs`}>Loading...</span>
                    </div>
                  ) : usernameHistory.length > 0 ? (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {usernameHistory.map((entry, index) => (
                        <div key={index} className={`text-xs text-${theme.textMuted} flex justify-between items-center py-1`}>
                          <span>
                            <span className="font-mono">{entry.old_username}</span>
                            <span className="mx-2">→</span>
                            <span className="font-mono">{entry.new_username}</span>
                          </span>
                          <span className="text-xs opacity-75">
                            {new Date(entry.changed_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={`text-${theme.textMuted} text-xs`}>No username changes found.</p>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-md font-medium transition-all duration-200 hover:scale-105 ${
                loading
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  : `bg-${theme.primary} hover:bg-${theme.primaryHover} text-white hover:${theme.glow}`
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Updating...
                </span>
              ) : 'Update Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
