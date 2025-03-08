import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// API utilities for different resources
export const courseApi = {
  getAll: params => api.get('/courses', { params }).then(res => res.data),
  getById: id => api.get(`/courses/${id}`).then(res => res.data),
  create: data => api.post('/courses', data).then(res => res.data),
  update: (id, data) => api.put(`/courses/${id}`, data).then(res => res.data),
  delete: id => api.delete(`/courses/${id}`).then(res => res.data),
};

export const scheduleApi = {
  getAll: () => api.get('/schedules').then(res => res.data),
  getById: id => api.get(`/schedules/${id}`).then(res => res.data),
  create: data => api.post('/schedules', data).then(res => res.data),
  update: (id, data) => api.put(`/schedules/${id}`, data).then(res => res.data),
  delete: id => api.delete(`/schedules/${id}`).then(res => res.data),
  getByCourse: courseId => api.get(`/schedules/course/${courseId}`).then(res => res.data),
};

export const newsApi = {
  getAll: () => api.get('/news').then(res => res.data),
  getById: id => api.get(`/news/${id}`).then(res => res.data),
  create: data => api.post('/news', data).then(res => res.data),
  update: (id, data) => api.put(`/news/${id}`, data).then(res => res.data),
  delete: id => api.delete(`/news/${id}`).then(res => res.data),
};

export const contactApi = {
  send: data => api.post('/contact', data).then(res => res.data),
};

export default api;
