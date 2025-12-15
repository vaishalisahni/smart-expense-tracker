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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return authView === 'login' ? (
      <Login onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <Register onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  // Setup not completed
  if (!user.setupCompleted) {
    return (
      <InitialSetup
        onComplete={async () => {
          await refreshUser(); // ✅ refresh user from backend
        }}
      />
    );
  }

  // Fully authenticated & setup done
  return <Dashboard />;
};

export default App;
