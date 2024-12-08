import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://studyflow-k4ec.onrender.com';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true, // Enable credentials for CORS
  timeout: 10000 // 10 second timeout
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Add CORS headers
    config.headers['Access-Control-Allow-Credentials'] = true;
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error);
      throw new Error('Network error - please check your connection');
    }

    // Handle specific error codes
    switch (error.response.status) {
      case 401:
        // Check if it's a token expiration
        if (error.response.data?.code === 'TOKEN_EXPIRED') {
          console.log('Token expired, redirecting to login...');
          localStorage.removeItem('token');
          window.location.href = '/login?expired=true';
          return Promise.reject(new Error('Session expired. Please log in again.'));
        }
        
        // Handle other unauthorized errors
        if (!originalRequest._retry) {
          originalRequest._retry = true;
          localStorage.removeItem('token');
          window.location.href = '/login';
          return Promise.reject(new Error('Authentication required. Please log in.'));
        }
        break;

      case 404:
        console.error('Resource not found:', error.response.data);
        throw new Error(error.response.data.message || 'Resource not found');

      case 502:
        console.error('Server temporarily unavailable (502):', error);
        throw new Error('Server is starting up. Please try again in a moment.');

      default:
        // Handle CORS errors
        if (error.response.status === 0 && error.message.includes('Network Error')) {
          console.error('CORS error:', error);
          throw new Error('Unable to connect to server - CORS error');
        }
        
        // Handle other errors
        console.error('API error:', error.response.data);
        throw new Error(error.response.data.message || 'An unexpected error occurred');
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },
};

export default api;
