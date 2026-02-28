// directory.js - Directory API Integration
const API_URL = 'http://127.0.0.1:7074/api';

export const getUsers = async (token, search = '') => {
  try {
    const url = `${API_URL}/users${search ? `?search=${search}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch users');
    return data;
  } catch (error) {
    console.error('Get Users Error:', error);
    throw error;
  }
};
