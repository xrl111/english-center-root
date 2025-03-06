import axios, { AxiosInstance } from 'axios';

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

interface Course {
  _id: string;
  title: string;
  description: string;
  level: string;
  duration: string;
  startDate: string;
  endDate: string;
  image?: string;
}

interface Schedule {
  _id: string;
  courseId: string;
  startTime: string;
  endTime: string;
  date: string;
  isCanceled?: boolean;
}

interface News {
  _id: string;
  title: string;
  content: string;
  publishDate: string;
  imageUrl?: string;
}

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const courseApi = {
  getAll: (params?: any) => api.get<Course[]>('/courses', { params }).then((res) => res.data),
  getById: (id: string) => api.get<Course>(`/courses/${id}`).then((res) => res.data),
  create: (data: Partial<Course>) => api.post<Course>('/courses', data).then((res) => res.data),
  update: (id: string, data: Partial<Course>) => api.put<Course>(`/courses/${id}`, data).then((res) => res.data),
  delete: (id: string) => api.delete<void>(`/courses/${id}`).then((res) => res.data),
};

export const scheduleApi = {
  getAll: () => api.get<Schedule[]>('/schedules').then((res) => res.data),
  getById: (id: string) => api.get<Schedule>(`/schedules/${id}`).then((res) => res.data),
  create: (data: Partial<Schedule>) => api.post<Schedule>('/schedules', data).then((res) => res.data),
  update: (id: string, data: Partial<Schedule>) => api.put<Schedule>(`/schedules/${id}`, data).then((res) => res.data),
  delete: (id: string) => api.delete<void>(`/schedules/${id}`).then((res) => res.data),
  getByCourse: (courseId: string) => api.get<Schedule[]>(`/schedules/course/${courseId}`).then((res) => res.data),
};

export const newsApi = {
  getAll: () => api.get<News[]>('/news').then((res) => res.data),
  getById: (id: string) => api.get<News>(`/news/${id}`).then((res) => res.data),
  create: (data: Partial<News>) => api.post<News>('/news', data).then((res) => res.data),
  update: (id: string, data: Partial<News>) => api.put<News>(`/news/${id}`, data).then((res) => res.data),
  delete: (id: string) => api.delete<void>(`/news/${id}`).then((res) => res.data),
};

export const contactApi = {
  send: (data: ContactForm) => api.post<void>('/contact', data).then((res) => res.data),
};

export default api;