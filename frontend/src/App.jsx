import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import InitialSetup from './components/InitialSetup';
import Dashboard from './components/Dashboard/DashboardHome';

const App = () => {
  const [authView, setAuthView] = useState('login');

  return (
    <AuthProvider>
      <AuthContent authView={authView} setAuthView={setAuthView} />
    </AuthProvider>
  );
};

const AuthContent = ({ authView, setAuthView }) => {
  const { user, loading, refreshUser } = useAuth();

  // ✅ Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-indigo-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // ✅ Not authenticated - show login or register
  if (!user) {
    return authView === 'login' ? (
      <Login onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <Register onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  // ✅ FIXED: Setup not completed - show initial setup
  if (!user.setupCompleted) {
    return (
      <InitialSetup onComplete={refreshUser} />
    );
  }

  // ✅ Fully authenticated & setup done - show dashboard
  return <Dashboard />;
};

export default App;