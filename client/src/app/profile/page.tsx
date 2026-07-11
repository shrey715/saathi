"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, ApiError } from '@/lib/api';

// Add type interfaces
interface UserData {
  username?: string;
  password?: string;
  gender?: string;
  dob?: string;
  age?: number | null;
  joinDate?: Date | string | null;
  journals?: unknown[];
  created_at?: string;
  createdAt?: string;
  [key: string]: unknown; // Allow for any additional properties
}

interface FormDataType {
  username: string;
  password: string;
  newPassword: string;
  confirmPassword: string;
  gender: string;
  dob: string;
}

interface ErrorsType {
  username?: string;
  password?: string;
  newPassword?: string;
  confirmPassword?: string;
  gender?: string;
  dob?: string;
  [key: string]: string | undefined;
}

const ProfilePage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState<FormDataType>({
    username: '',
    password: '',
    newPassword: '',
    confirmPassword: '',
    gender: '',
    dob: ''
  });
  const [errors, setErrors] = useState<ErrorsType>({});
  const [editMode, setEditMode] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const calculateAge = (dob: string): number | null => {
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

  const fetchUserDetails = async (): Promise<UserData | null> => {
    try {
      const data = await authApi.getUserDetails();
      return {
        ...data,
        name: data.username,
        age: data.dob ? calculateAge(data.dob) : null,
        journalCount: Array.isArray(data.journals) ? data.journals.length : 0,
        joinDate: data.created_at ? new Date(data.created_at) : null,
      };
    } catch (err) {
      console.error('Fetch user details error:', err);
      if (err instanceof ApiError && err.status === 401) {
        router.push('/login');
      }
      return null;
    }
  };

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
          gender: userData.gender || '',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: ErrorsType = {};

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

  const handleSubmit = async (e: React.FormEvent) => {
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
      const payload: {
        gender?: string;
        dob?: string;
        currentPassword?: string;
        newPassword?: string;
      } = {
        gender: user && formData.gender !== user.gender ? formData.gender : undefined,
        dob: user && formData.dob !== (user.dob ? new Date(user.dob).toISOString().split('T')[0] : '') ? formData.dob : undefined
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

      await authApi.updateUser(payload);

      // Fetch updated user data
      const updatedUserData = await fetchUserDetails();
      setUser(updatedUserData);

      // Update form data with new values
      if (updatedUserData) {
        setFormData(prev => ({
          ...prev,
          username: updatedUserData.username || '',
          password: '',
          newPassword: '',
          confirmPassword: '',
          gender: updatedUserData.gender || '',
          dob: updatedUserData.dob ? new Date(updatedUserData.dob).toISOString().split('T')[0] : ''
        }));
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditMode(false);
      setChangePassword(false);

    } catch (error: unknown) {
      console.error('Error updating profile:', error);
      const text = error instanceof ApiError ? error.message : 'Failed to update profile. Please try again.';
      setMessage({ type: 'error', text });
    } finally {
      setSaving(false);
    }
  };

  // Function to format date for display
  const formatDate = (dateString?: string) => {
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
      <div className="min-h-full bg-background flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground font-medium">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background pb-16">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={goBack}
            className="flex items-center text-primary hover:text-primary/80 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-foreground">
            Profile Settings
          </h1>
          <div className="w-5"></div> {/* Empty div for balancing layout */}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Profile header */}
        <div className="bg-card rounded-2xl shadow-neu-md p-6 mb-6">
          <div className="flex items-center flex-wrap gap-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-2xl font-display font-bold shrink-0 shadow-neu-sm">
              {user?.username?.substring(0, 1).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-foreground truncate">{user?.username || "User"}</h2>
              <p className="text-primary text-sm">
                {user?.age ? `${user.age} years old` : "Age not set"}
              </p>
              <p className="text-sm text-muted-foreground">
                {user?.joinDate ? `Joined ${new Date(user.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}` : ""}
              </p>
            </div>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-full transition-colors text-sm font-medium"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Display message if any */}
        {message.text && (
          <div className={`p-4 rounded-lg mb-6 ${message.type === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-mood-growth-soft text-mood-growth'}`}>
            {message.text}
          </div>
        )}

        {/* Profile form */}
        <div className="bg-card rounded-xl shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Username field */}
              <div className="relative">
                <label className="block text-sm font-medium text-foreground mb-1">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  {/* Always show as read-only, even in edit mode */}
                  <div className="bg-muted rounded-lg block w-full pl-10 pr-3 py-2 text-foreground">
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
                      className="h-4 w-4 text-primary focus:ring-ring border-input rounded"
                    />
                    <label htmlFor="changePassword" className="ml-2 block text-sm text-foreground">
                      Change Password
                    </label>
                  </div>

                  {changePassword && (
                    <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                      {/* Current password */}
                      <div className="relative">
                        <label className="block text-sm font-medium text-foreground mb-1">Current Password</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`bg-primary/10 border ${errors.password ? 'border-destructive/50' : 'border-primary/30'} rounded-lg block w-full pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring`}
                            disabled={saving}
                          />
                        </div>
                        {errors.password && <p className="mt-1 text-sm text-destructive">{errors.password}</p>}
                      </div>

                      {/* New password */}
                      <div className="relative">
                        <label className="block text-sm font-medium text-foreground mb-1">New Password</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            className={`bg-primary/10 border ${errors.newPassword ? 'border-destructive/50' : 'border-primary/30'} rounded-lg block w-full pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring`}
                            disabled={saving}
                          />
                        </div>
                        {errors.newPassword && <p className="mt-1 text-sm text-destructive">{errors.newPassword}</p>}
                      </div>

                      {/* Confirm password */}
                      <div className="relative">
                        <label className="block text-sm font-medium text-foreground mb-1">Confirm New Password</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`bg-primary/10 border ${errors.confirmPassword ? 'border-destructive/50' : 'border-primary/30'} rounded-lg block w-full pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring`}
                            disabled={saving}
                          />
                        </div>
                        {errors.confirmPassword && <p className="mt-1 text-sm text-destructive">{errors.confirmPassword}</p>}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Gender field */}
              <div className="relative">
                <label className="block text-sm font-medium text-foreground mb-1">Gender</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                  </div>
                  {editMode ? (
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="bg-primary/10 border border-primary/30 rounded-lg block w-full pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                      disabled={saving}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  ) : (
                    <div className="bg-muted rounded-lg block w-full pl-10 pr-3 py-2 text-foreground">
                      {user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : "Not specified"}
                    </div>
                  )}
                </div>
              </div>

              {/* Date of Birth field */}
              <div className="relative">
                <label className="block text-sm font-medium text-foreground mb-1">Date of Birth</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  {editMode ? (
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className={`bg-primary/10 border ${errors.dob ? 'border-destructive/50' : 'border-primary/30'} rounded-lg block w-full pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring`}
                      disabled={saving}
                    />
                  ) : (
                    <div className="bg-muted rounded-lg block w-full pl-10 pr-3 py-2 text-foreground">
                      {user?.dob ? formatDate(user.dob) : "Not set"}
                    </div>
                  )}
                </div>
                {errors.dob && <p className="mt-1 text-sm text-destructive">{errors.dob}</p>}
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
                        username: user?.username || '',
                        password: '',
                        newPassword: '',
                        confirmPassword: '',
                        gender: user?.gender || '',
                        dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : ''
                      });
                    }}
                    className="px-4 py-2 rounded-full text-foreground hover:bg-muted transition-colors shadow-neu-inset"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-full shadow-neu-sm hover:bg-primary/90 transition-colors"
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