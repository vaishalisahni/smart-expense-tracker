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

        {/* Initial Setup */}
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
    // User logged in but setup not done
    if (!user.setupCompleted) {
      return <Navigate to="/setup" replace />;
    }
    // Fully authenticated
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

  // Require setup but not completed
  if (requireSetup && !user.setupCompleted) {
    return <Navigate to="/setup" replace />;
  }

  // Setup page but already completed
  if (!requireSetup && user.setupCompleted) {
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
