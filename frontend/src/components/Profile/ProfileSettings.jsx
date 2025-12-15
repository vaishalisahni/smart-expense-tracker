import React, { useState } from 'react';
import { User, Lock, DollarSign, Bell, Save, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ProfileSettings = ({ onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    monthlyBudget: user?.monthlyBudget || 5000,
    weeklyBudget: user?.weeklyBudget || 1250
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [preferences, setPreferences] = useState({
    notifications: user?.preferences?.notifications ?? true,
    emailAlerts: user?.preferences?.emailAlerts ?? true,
    budgetAlerts: {
      at70: user?.preferences?.budgetAlerts?.at70 ?? true,
      at90: user?.preferences?.budgetAlerts?.at90 ?? true,
      at100: user?.preferences?.budgetAlerts?.at100 ?? true
    },
    currency: user?.preferences?.currency || 'INR',
    theme: user?.preferences?.theme || 'light'
  });

  const handleProfileUpdate = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: profileData.name,
          monthlyBudget: parseFloat(profileData.monthlyBudget),
          weeklyBudget: parseFloat(profileData.weeklyBudget),
          preferences
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Profile updated successfully!');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setError(data.error || 'Failed to change password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateWeeklyBudget = (monthly) => {
    return Math.round(monthly / 4);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl my-4 sm:my-8 max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b flex-shrink-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Profile Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b overflow-x-auto scrollbar-hide flex-shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 min-w-[120px] py-3 px-4 font-medium transition text-xs sm:text-sm ${
              activeTab === 'profile'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <User className="w-4 h-4 inline mr-1 sm:mr-2" />
            Profile & Budget
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 min-w-[120px] py-3 px-4 font-medium transition text-xs sm:text-sm ${
              activeTab === 'password'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Lock className="w-4 h-4 inline mr-1 sm:mr-2" />
            Password
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex-1 min-w-[120px] py-3 px-4 font-medium transition text-xs sm:text-sm ${
              activeTab === 'preferences'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Bell className="w-4 h-4 inline mr-1 sm:mr-2" />
            Preferences
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {success}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (Cannot be changed)
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-sm sm:text-base"
                />
              </div>

              <div className="border-t pt-4 sm:pt-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-indigo-600" />
                  Budget Settings
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Budget (₹)
                    </label>
                    <input
                      type="number"
                      value={profileData.monthlyBudget}
                      onChange={(e) => {
                        const monthly = parseFloat(e.target.value) || 0;
                        setProfileData({
                          ...profileData,
                          monthlyBudget: monthly,
                          weeklyBudget: calculateWeeklyBudget(monthly)
                        });
                      }}
                      className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                      min="0"
                      step="100"
                    />
                    <p className="mt-1 text-xs sm:text-sm text-gray-500">
                      Set your total monthly spending limit
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weekly Budget (₹)
                    </label>
                    <input
                      type="number"
                      value={profileData.weeklyBudget}
                      onChange={(e) => setProfileData({ ...profileData, weeklyBudget: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                      min="0"
                      step="50"
                    />
                    <p className="mt-1 text-xs sm:text-sm text-gray-500">
                      Recommended: ₹{calculateWeeklyBudget(profileData.monthlyBudget)} (Monthly ÷ 4)
                    </p>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 sm:p-4">
                    <h4 className="font-medium text-indigo-900 mb-2 text-sm sm:text-base">Budget Breakdown</h4>
                    <div className="space-y-1 text-xs sm:text-sm text-indigo-800">
                      <p>• Daily limit: ₹{Math.round(profileData.monthlyBudget / 30)}</p>
                      <p>• Weekly limit: ₹{profileData.weeklyBudget}</p>
                      <p>• Monthly limit: ₹{profileData.monthlyBudget}</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleProfileUpdate}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 sm:py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Confirm new password"
                />
              </div>

              <button
                onClick={handlePasswordChange}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 sm:py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <Lock className="w-4 h-4" />
                <span>{loading ? 'Changing...' : 'Change Password'}</span>
              </button>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Notifications</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                    <span className="text-gray-700 text-sm sm:text-base">Enable all notifications</span>
                    <input
                      type="checkbox"
                      checked={preferences.notifications}
                      onChange={(e) => setPreferences({ ...preferences, notifications: e.target.checked })}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                    <span className="text-gray-700 text-sm sm:text-base">Email alerts</span>
                    <input
                      type="checkbox"
                      checked={preferences.emailAlerts}
                      onChange={(e) => setPreferences({ ...preferences, emailAlerts: e.target.checked })}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                    />
                  </label>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Budget Alerts</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3">Get notified when you reach these budget thresholds:</p>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                    <span className="text-gray-700 text-sm sm:text-base">70% of budget used</span>
                    <input
                      type="checkbox"
                      checked={preferences.budgetAlerts.at70}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        budgetAlerts: { ...preferences.budgetAlerts, at70: e.target.checked }
                      })}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                    <span className="text-gray-700 text-sm sm:text-base">90% of budget used</span>
                    <input
                      type="checkbox"
                      checked={preferences.budgetAlerts.at90}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        budgetAlerts: { ...preferences.budgetAlerts, at90: e.target.checked }
                      })}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                    <span className="text-gray-700 text-sm sm:text-base">100% budget exceeded</span>
                    <input
                      type="checkbox"
                      checked={preferences.budgetAlerts.at100}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        budgetAlerts: { ...preferences.budgetAlerts, at100: e.target.checked }
                      })}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                    />
                  </label>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Display Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      value={preferences.currency}
                      onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                      className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Theme
                    </label>
                    <select
                      value={preferences.theme}
                      onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                      className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark (Coming Soon)</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                onClick={handleProfileUpdate}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 sm:py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving...' : 'Save Preferences'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default ProfileSettings;