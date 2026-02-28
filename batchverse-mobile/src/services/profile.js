// profile.js - Profile API Integration
const API_URL = 'http://127.0.0.1:7074/api';

export const getProfile = async (token) => {
  try {
    const response = await fetch(`${API_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch profile');
    return data;
  } catch (error) {
    console.error('Get Profile Error:', error);
    throw error;
  }
};

export const updateProfile = async (token, bio, photoUrl) => {
  try {
    const response = await fetch(`${API_URL}/users/me`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bio, photoUrl }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update profile');
    return data;
  } catch (error) {
    console.error('Update Profile Error:', error);
    throw error;
  }
};
