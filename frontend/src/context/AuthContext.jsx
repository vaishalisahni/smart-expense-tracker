import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// Mock API Service (replace with real API calls later)
const API = {
  login: async (email, password) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (email && password) {
      const user = { id: '1', name: 'John Doe', email, role: 'student' };
      const token = 'mock_jwt_token_' + Date.now();
      return { user, token };
    }
    throw new Error('Invalid credentials');
  },
  
  register: async (name, email, password) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = { id: Date.now().toString(), name, email, role: 'student' };
    const token = 'mock_jwt_token_' + Date.now();
    return { user, token };
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { user, token } = await API.login(email, password);
    setUser(user);
    setToken(token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
  };

  const register = async (name, email, password) => {
    const { user, token } = await API.register(name, email, password);
    setUser(user);
    setToken(token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
