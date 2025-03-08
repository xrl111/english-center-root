import axios from './axios';

export const authApi = {
  login: async credentials => {
    const response = await axios.post('/auth/login', credentials);
    return response.data;
  },

  register: async userData => {
    const response = await axios.post('/auth/register', userData);
    return response.data;
  },

  logout: async refreshToken => {
    const response = await axios.post('/auth/logout', { refreshToken });
    return response.data;
  },

  refreshToken: async refreshToken => {
    const response = await axios.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  requestPasswordReset: async email => {
    const response = await axios.post('/auth/request-password-reset', { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await axios.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  getProfile: async () => {
    const response = await axios.get('/auth/profile');
    return response.data;
  },
};
