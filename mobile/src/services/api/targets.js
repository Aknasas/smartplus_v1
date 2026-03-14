// mobile/src/services/api/targets.js
import api from './client';

export const getHealthTargets = async (userId) => {
  const response = await api.get(`/api/users/${userId}/targets`);
  return response.data;
};