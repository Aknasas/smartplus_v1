// mobile/src/services/api/users.js
import api from './client';

export const getUsers = (page = 1, limit = 20) =>
  api.get('/api/users', { params: { page, limit } }).then(res => res.data);

export const getUser = async (userId) => {
  const response = await api.get(`/api/users/${userId}`);
  return response.data;
};

export const updateUser = async (userId, data) => {
  const response = await api.put(`/api/users/${userId}`, data);
  return response.data;
};