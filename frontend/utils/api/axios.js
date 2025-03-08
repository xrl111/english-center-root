import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for handling token refresh
instance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // If the error is not 401 or the request was for refreshing token, reject
    if (error.response?.status !== 401 || originalRequest.url === '/auth/refresh') {
      return Promise.reject(error);
    }

    try {
      // Try to refresh the token
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token');

      const response = await instance.post('/auth/refresh', { refreshToken });
      const { accessToken, refreshToken: newRefreshToken } = response.data;

      // Update tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      // Update Authorization header
      instance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

      // Retry the original request
      return instance(originalRequest);
    } catch (refreshError) {
      // If refresh fails, clear tokens and reject
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      delete instance.defaults.headers.common['Authorization'];
      return Promise.reject(refreshError);
    }
  }
);

// Request interceptor for adding token
instance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default instance;
