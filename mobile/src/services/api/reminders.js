// mobile/src/services/api/reminders.js
import api from './client';

export const getReminders = async (userId, options = {}) => {
  try {
    const params = {};
    if (options.active_only !== undefined) params.active_only = options.active_only;
    if (options.upcoming !== undefined) params.upcoming = options.upcoming;

    const response = await api.get(`/api/users/${userId}/reminders`, { params });

    // Ensure consistent response format
    return {
      success: true,
      reminders: response.data.reminders || response.data || []
    };
  } catch (error) {
    console.error('Get reminders error:', error);
    return {
      success: false,
      reminders: [],
      error: error.response?.data?.message || error.message
    };
  }
};

export const createReminder = async (userId, reminderData) => {
  try {
    const response = await api.post(`/api/users/${userId}/reminders`, reminderData);
    return {
      success: true,
      reminder: response.data.reminder || response.data
    };
  } catch (error) {
    console.error('Create reminder error:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

export const updateReminder = async (reminderId, reminderData) => {
  try {
    const response = await api.put(`/api/reminders/${reminderId}`, reminderData);
    return {
      success: true,
      reminder: response.data.reminder || response.data
    };
  } catch (error) {
    console.error('Update reminder error:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

export const deleteReminder = async (reminderId) => {
  try {
    const response = await api.delete(`/api/reminders/${reminderId}`);
    return { success: true };
  } catch (error) {
    console.error('Delete reminder error:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

export const completeReminder = async (reminderId, snoozeMinutes = null) => {
  try {
    const response = await api.patch(`/api/reminders/${reminderId}/complete`, {
      completed: true,
      snooze_minutes: snoozeMinutes
    });
    return {
      success: true,
      snoozed: !!snoozeMinutes,
      reminder: response.data
    };
  } catch (error) {
    console.error('Complete reminder error:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};