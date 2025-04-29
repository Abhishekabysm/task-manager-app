import axios from 'axios';

// Define the base URL for the API backend
// In a real app, use environment variables: process.env.NEXT_PUBLIC_API_URL
const API_BASE_URL = 'http://localhost:5000/api'; // Adjust if your backend runs elsewhere

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
  (config) => {
    // Check if running in the browser environment before accessing localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
      if (token) {
        config.headers['x-auth-token'] = token;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Add a response interceptor to handle common errors (e.g., 401 Unauthorized)
api.interceptors.response.use(
  (response) => {
    return response; // Pass through successful responses
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized errors (e.g., token expired)
      console.error('API Error: Unauthorized (401). Token might be invalid or expired.');
      // Optional: Redirect to login or clear token
      if (typeof window !== 'undefined') {
         // localStorage.removeItem('token');
         // window.location.href = '/login'; // Force redirect
      }
    }
    // Forward other errors
    return Promise.reject(error);
  }
);


export default api;

// Add these functions to your existing API client

export const getNotifications = async () => {
  try {
    // Use the api instance with proper authentication headers
    const response = await api.get('/tasks/notifications');
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Mark notifications as read
export const markNotificationRead = async (taskId) => {
  try {
    // Use the api instance with proper authentication headers
    const response = await api.put(`/tasks/notifications/${taskId}`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Get all users for task assignment
export const getUsers = async () => {
  try {
    const response = await api.get('/users'); // Correct endpoint
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};
