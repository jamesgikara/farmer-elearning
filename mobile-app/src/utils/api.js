// mobile-app/src/utils/api.js
// Axios instance with JWT interceptor

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = __DEV__
  ? 'http://10.0.2.2:5000/api'   // Android emulator → host machine
  : 'https://farmer-elearning.onrender.com/api';

const api = axios.create({ baseURL: BASE_URL, timeout: 15000 });

// Attach JWT token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await AsyncStorage.multiRemove(['token', 'user']);
      // Navigation reset is handled in App.js via event emitter if needed
    }
    return Promise.reject(err);
  }
);

export default api;