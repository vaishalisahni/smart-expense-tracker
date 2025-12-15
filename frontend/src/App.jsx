import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
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
  const { user, loading } = useAuth();
  const [setupComplete, setSetupComplete] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in - show auth screens
  if (!user) {
    return authView === 'login' ? (
      <Login onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <Register onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  // Logged in but setup not complete - show initial setup
  if (!user.setupCompleted && !setupComplete) {
    return <InitialSetup onComplete={() => {
      setSetupComplete(true);
      window.location.reload(); // Reload to fetch updated user data
    }} />;
  }

  // All good - show dashboard
  return <Dashboard />;
};

export default App;