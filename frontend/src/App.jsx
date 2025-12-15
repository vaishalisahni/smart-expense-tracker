import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import InitialSetup from './components/InitialSetup';
import Dashboard from './components/Dashboard/DashboardHome';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/setup" element={<ProtectedRoute requireSetup={false}><InitialSetup /></ProtectedRoute>} />
          <Route path="/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

// Public routes - redirect to dashboard if authenticated
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (user) {
    // If user hasn't completed setup, redirect to setup
    if (!user.setupCompleted) {
      return <Navigate to="/setup" replace />;
    }
    // Otherwise redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Protected routes - require authentication
const ProtectedRoute = ({ children, requireSetup = true }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If setup is required but not completed, redirect to setup
  if (requireSetup && !user.setupCompleted) {
    return <Navigate to="/setup" replace />;
  }

  // If setup is completed but on setup page, redirect to dashboard
  if (!requireSetup && user.setupCompleted) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Loading screen component
const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-indigo-200">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-700 font-medium">Loading...</p>
      </div>
    </div>
  );
};

export default App;