// mobile/src/services/api/reminders.js
import api from './client';

export const getReminders = async (
  userId,
  options?: { active_only?: boolean; upcoming?: boolean }
) => {
  const params: any = {};
  if (options?.active_only !== undefined) params.active_only = options.active_only;
  if (options?.upcoming !== undefined) params.upcoming = options.upcoming;

  const response = await api.get(`/api/users/${userId}/reminders`, { params });
  return response.data;
};