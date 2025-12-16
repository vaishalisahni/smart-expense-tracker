import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Auth pages
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";

// App pages
import InitialSetup from "./components/InitialSetup";
import Dashboard from "./components/Dashboard/DashboardHome";

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Initial Setup - FIXED: Only shows if NOT completed */}
        <Route
          path="/setup"
          element={
            <ProtectedRoute requireSetup={false}>
              <InitialSetup />
            </ProtectedRoute>
          }
        />

        {/* Dashboard (Protected & Nested) */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Root Redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 404 Redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;

//////////////////////////////
// Route Guards
//////////////////////////////

// Public routes → redirect if authenticated
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (user) {
    // FIXED: Check if setup is completed
    if (user.setupCompleted === false) {
      return <Navigate to="/setup" replace />;
    }
    // Fully authenticated with setup done
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Protected routes → require auth
const ProtectedRoute = ({ children, requireSetup = true }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // FIXED: Proper setup completion check
  // If setup is required but not completed → redirect to setup
  if (requireSetup && user.setupCompleted === false) {
    return <Navigate to="/setup" replace />;
  }

  // FIXED: If on setup page but setup already completed → redirect to dashboard
  if (!requireSetup && user.setupCompleted === true) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

//////////////////////////////
// Loading Screen
//////////////////////////////

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
