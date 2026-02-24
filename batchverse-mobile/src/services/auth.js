import axios from 'axios';

// Placeholder URL for local development. 
// For Android Emulator use 'http://10.0.2.2:7071/api'
// For iOS Simulator use 'http://localhost:7071/api'
const API_URL = 'http://localhost:7071/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = async (email, password) => {
  try {
    // In a real app, this endpoint would return a JWT token
    const response = await api.post('/login', { email, password });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network Error');
  }
};

export const signup = async (userData) => {
  try {
    const response = await api.post('/signup', userData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network Error');
  }
};

export default {
  login,
  signup,
};
