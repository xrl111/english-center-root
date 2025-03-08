import axios from './axios';

export const newsApi = {
  getAllNews: async () => {
    const response = await axios.get('/news');
    return response.data;
  },

  getNewsById: async id => {
    const response = await axios.get(`/news/${id}`);
    return response.data;
  },

  createNews: async data => {
    const response = await axios.post('/news', data);
    return response.data;
  },

  updateNews: async (id, data) => {
    const response = await axios.put(`/news/${id}`, data);
    return response.data;
  },

  deleteNews: async id => {
    const response = await axios.delete(`/news/${id}`);
    return response.data;
  },

  getRelatedNews: async id => {
    const response = await axios.get(`/news/${id}/related`);
    return response.data;
  },
};
