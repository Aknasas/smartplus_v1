// mobile/src/services/api/anomalies.js
import api from './client';

export const getAnomalies = async (
  userId,
  options?: { resolved?: boolean; limit?: number }
) => {
  const params: any = { limit: options?.limit || 50 };
  if (options?.resolved !== undefined) params.resolved = options.resolved;

  const response = await api.get(`/api/users/${userId}/anomalies`, { params });
  return response.data;
};