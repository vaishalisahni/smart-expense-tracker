import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // ✅ REQUIRED for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized – session expired');
    }
    return Promise.reject(error);
  }
);

export default api;
