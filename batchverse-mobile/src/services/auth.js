// auth.js - Using native fetch instead of axios
// Works better in Expo/RN environments without polyfills

// Using 127.0.0.1 for local dev (Simulator)
const API_URL = 'http://127.0.0.1:7074/api';

export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Login failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Login Error:', error);
    throw error;
  }
};

export const signup = async (email, password, fullName, batchYear) => {
  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, fullName, batchYear }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Signup failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Signup Error:', error);
    throw error;
  }
};
