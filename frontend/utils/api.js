import axios from 'axios';
import config from '../config';

const api = axios.create({
  baseURL: config.api.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    // Handle token expiration
    if (response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
      return Promise.reject(new Error('Session expired. Please login again.'));
    }

    // Handle other errors
    const message = response?.data?.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export const courseApi = {
  getAll: (params) => api.get('/api/courses', { params }),
  getOne: (id) => api.get(`/api/courses/${id}`),
  create: (data) => api.post('/api/courses', data),
  update: (id, data) => api.put(`/api/courses/${id}`, data),
  delete: (id) => api.delete(`/api/courses/${id}`),
  addStudent: (courseId, studentId) => api.post(`/api/courses/${courseId}/students`, { studentId }),
  removeStudent: (courseId, studentId) => api.delete(`/api/courses/${courseId}/students/${studentId}`),
  getStudents: (courseId) => api.get(`/api/courses/${courseId}/students`),
};

export const newsApi = {
  getAll: (params) => api.get('/api/news', { params }),
  getOne: (id) => api.get(`/api/news/${id}`),
  create: (data) => api.post('/api/news', data),
  update: (id, data) => api.put(`/api/news/${id}`, data),
  delete: (id) => api.delete(`/api/news/${id}`),
  publish: (id) => api.put(`/api/news/${id}/publish`),
  unpublish: (id) => api.put(`/api/news/${id}/unpublish`),
};

export const scheduleApi = {
  getAll: (params) => api.get('/api/schedules', { params }),
  getOne: (id) => api.get(`/api/schedules/${id}`),
  create: (data) => api.post('/api/schedules', data),
  update: (id, data) => api.put(`/api/schedules/${id}`, data),
  delete: (id) => api.delete(`/api/schedules/${id}`),
  cancel: (id) => api.put(`/api/schedules/${id}/cancel`),
  restore: (id) => api.put(`/api/schedules/${id}/restore`),
};

export const userApi = {
  getCurrent: () => api.get('/api/auth/profile'),
  getAll: (params) => api.get('/api/auth/users', { params }),
  updateRole: (userId, role) => api.put(`/api/auth/users/${userId}/role`, { role }),
  toggleStatus: (userId, isActive) => api.put(`/api/auth/users/${userId}/status`, { isActive }),
};

export const authApi = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (data) => api.post('/api/auth/register', data),
  getProfile: () => api.get('/api/auth/profile'),
};

export default api;