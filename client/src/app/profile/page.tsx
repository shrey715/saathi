"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const ProfilePage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    newPassword: '',
    confirmPassword: '',
    sex: '',
    dob: ''
  });
  const [errors, setErrors] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Get token from localStorage
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
          router.push('/login');
          return;
        }

        // Fetch user data using the same function as in home page
        const userData = await fetchUserDetails();
        
        if (!userData) {
          throw new Error('Failed to fetch user data');
        }

        setUser(userData);
        
        // Initialize form data with user data
        setFormData({
          username: userData.username || '',
          password: '',
          newPassword: '',
          confirmPassword: '',
          sex: userData.sex || '',
          dob: userData.dob ? new Date(userData.dob).toISOString().split('T')[0] : ''
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setMessage({ type: 'error', text: 'Failed to load profile data. Please try again later.' });
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const fetchUserDetails = async () => {
    try {
      // Get the auth token from localStorage
      const token = localStorage.getItem('accessToken');
  
      if (!token) {
        console.error('Authentication token not found');
        router.push('/login');
        return null;
      }
  
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL + '/api/get-user-details';
      console.log('Fetching user details from:', backendUrl);
      
      const response = await fetch(backendUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
  
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch user details');
      }
  
      // If we have valid user data
      if (data) {
        console.log('Received user data:', data);
        // Transform the data based on your backend response
        const enhancedUserData = {
          ...data,
          // Use username as display name
          name: data.username,
          // Calculate age from DOB if available
          age: data.dob ? calculateAge(data.dob) : null,
          // Count journal entries if available
          journalCount: Array.isArray(data.journals) ? data.journals.length : 0,
          // MongoDB typically uses createdAt or created_at
          joinDate: data.created_at || data.createdAt ? new Date(data.created_at || data.createdAt) : null,
        };
        return enhancedUserData;
      } else {
        return null;
      }
    } catch (err) {
      console.error('Fetch user details error:', err);
      return null;
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return null;
  
    const birthDate = new Date(dob);
    const today = new Date();
  
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
  
    // Adjust age if birthday hasn't occurred yet this year
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
  
    return age;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (editMode) {

      if (changePassword) {
        if (!formData.password) {
          newErrors.password = "Current password is required";
        }
        
        if (!formData.newPassword) {
          newErrors.newPassword = "New password is required";
        } 
        
        if (formData.newPassword !== formData.confirmPassword) {
          newErrors.confirmPassword = "Passwords don't match";
        }
      }

      if (formData.dob) {
        const dobDate = new Date(formData.dob);
        const today = new Date();
        if (dobDate > today) {
          newErrors.dob = "Date of birth cannot be in the future";
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        router.push('/login');
        return;
      }
      
      // Create payload with only changed fields
      const payload = {
        sex: formData.sex !== user.sex ? formData.sex : undefined,
        dob: formData.dob !== (user.dob ? new Date(user.dob).toISOString().split('T')[0] : '') ? formData.dob : undefined
      };
      
      // Add password fields if changing password
      if (changePassword && formData.password && formData.newPassword) {
        payload.currentPassword = formData.password;
        payload.newPassword = formData.newPassword;
      }
      
      // Remove undefined values
      Object.keys(payload).forEach(key => 
        payload[key] === undefined && delete payload[key]
      );
      
      // Don't make API call if nothing changed
      if (Object.keys(payload).length === 0) {
        setEditMode(false);
        setSaving(false);
        return;
      }
      
      // Log the payload for debugging
      console.log('Update payload:', payload);
      
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL + '/api/update-user';
      console.log('Making update request to:', backendUrl);
      
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          throw new Error(`Failed to update profile: ${response.status} ${errorText}`);
        }
        throw new Error(errorData.detail || `Failed to update profile: ${response.status}`);
      }
      
      // Fetch updated user data
      const updatedUserData = await fetchUserDetails();
      setUser(updatedUserData);
      
      // Update form data with new values
      setFormData(prev => ({
        ...prev,
        username: updatedUserData.username || '',
        password: '',
        newPassword: '',
        confirmPassword: '',
        sex: updatedUserData.sex || '',
        dob: updatedUserData.dob ? new Date(updatedUserData.dob).toISOString().split('T')[0] : ''
      }));
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditMode(false);
      setChangePassword(false);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  // Function to format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const goBack = () => {
    router.push('/home');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-indigo-600 font-medium">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 pb-16">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={goBack}
            className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 inline-block text-transparent bg-clip-text">
            Profile Settings
          </h1>
          <div className="w-20"></div> {/* Empty div for balancing layout */}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user?.username?.substring(0, 1).toUpperCase() || "U"}
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-gray-800">{user?.username || "User"}</h2>
              <p className="text-indigo-600">
                {user?.age ? `${user.age} years old` : "Age not set"}
              </p>
              <p className="text-sm text-gray-500">
                {user?.joinDate ? `Joined ${new Date(user.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}` : ""}
              </p>
            </div>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="ml-auto bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-lg transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Display message if any */}
        {message.text && (
          <div className={`p-4 rounded-lg mb-6 ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message.text}
          </div>
        )}

        {/* Profile form */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Username field */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  {/* Always show as read-only, even in edit mode */}
                  <div className="bg-gray-50 rounded-lg block w-full pl-10 pr-3 py-2 text-gray-700">
                    {user?.username || "Not set"}
                  </div>
                </div>
              </div>
              {/* Password fields (only in edit mode) */}
              {editMode && (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="changePassword"
                      checked={changePassword}
                      onChange={() => setChangePassword(!changePassword)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="changePassword" className="ml-2 block text-sm text-gray-700">
                      Change Password
                    </label>
                  </div>
                  
                  {changePassword && (
                    <div className="space-y-4 pl-6 border-l-2 border-indigo-100">
                      {/* Current password */}
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`bg-indigo-50 border ${errors.password ? 'border-red-300' : 'border-indigo-300'} rounded-lg block w-full pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                            disabled={saving}
                          />
                        </div>
                        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                      </div>
                      
                      {/* New password */}
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            className={`bg-indigo-50 border ${errors.newPassword ? 'border-red-300' : 'border-indigo-300'} rounded-lg block w-full pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                            disabled={saving}
                          />
                        </div>
                        {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
                      </div>
                      
                      {/* Confirm password */}
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`bg-indigo-50 border ${errors.confirmPassword ? 'border-red-300' : 'border-indigo-300'} rounded-lg block w-full pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                            disabled={saving}
                          />
                        </div>
                        {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sex field */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                  </div>
                  {editMode ? (
                    <select
                      name="sex"
                      value={formData.sex}
                      onChange={handleChange}
                      className="bg-indigo-50 border border-indigo-300 rounded-lg block w-full pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      disabled={saving}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  ) : (
                    <div className="bg-gray-50 rounded-lg block w-full pl-10 pr-3 py-2 text-gray-700">
                      {user?.sex ? user.sex.charAt(0).toUpperCase() + user.sex.slice(1) : "Not specified"}
                    </div>
                  )}
                </div>
              </div>

              {/* Date of Birth field */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  {editMode ? (
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className={`bg-indigo-50 border ${errors.dob ? 'border-red-300' : 'border-indigo-300'} rounded-lg block w-full pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      disabled={saving}
                    />
                  ) : (
                    <div className="bg-gray-50 rounded-lg block w-full pl-10 pr-3 py-2 text-gray-700">
                      {user?.dob ? formatDate(user.dob) : "Not set"}
                    </div>
                  )}
                </div>
                {errors.dob && <p className="mt-1 text-sm text-red-600">{errors.dob}</p>}
              </div>

              {/* Form actions */}
              {editMode && (
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setChangePassword(false);
                      setErrors({});
                      // Reset form to original values
                      setFormData({
                        username: user.username || '',
                        password: '',
                        newPassword: '',
                        confirmPassword: '',
                        sex: user.sex || '',
                        dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : ''
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-lg hover:from-indigo-700 hover:to-blue-600 transition-colors"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;