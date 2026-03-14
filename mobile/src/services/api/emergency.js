// mobile/src/services/api/emergency.js
import api from './client';

export const getEmergencyContacts = async (userId) => {
  const response = await api.get(`/api/users/${userId}/emergency-contacts`);
  return response.data;
};