// mobile/src/services/api/anomalies.js
import api from './client';

// GET - For fetching anomalies (used by both screens)
export const getAnomalies = async (
  userId,
  options?: { resolved?: boolean; limit?: number; startDate?: string; endDate?: string }
) => {
  const params: any = { limit: options?.limit || 50 };
  if (options?.resolved !== undefined) params.resolved = options.resolved;
  if (options?.startDate) params.startDate = options.startDate;
  if (options?.endDate) params.endDate = options.endDate;

  const response = await api.get(`/api/users/${userId}/anomalies`, { params });
  return response.data;
};

// POST - Create a new anomaly (used by AnomalyDetectionScreen)
export const createAnomaly = async (userId, anomalyData) => {
  const response = await api.post(`/api/users/${userId}/anomalies`, anomalyData);
  return response.data;
};

// PUT/PATCH - Update an existing anomaly (mark as resolved, etc.)
export const updateAnomaly = async (userId, anomalyId, updateData) => {
  const response = await api.patch(`/api/users/${userId}/anomalies/${anomalyId}`, updateData);
  return response.data;
};

// DELETE - Remove an anomaly
export const deleteAnomaly = async (userId, anomalyId) => {
  const response = await api.delete(`/api/users/${userId}/anomalies/${anomalyId}`);
  return response.data;
};

// POST - Bulk create anomalies (if you detect multiple at once)
export const createBulkAnomalies = async (userId, anomalies) => {
  const response = await api.post(`/api/users/${userId}/anomalies/bulk`, { anomalies });
  return response.data;
};

// GET - Get anomaly statistics (for dashboard)
export const getAnomalyStats = async (userId, timeframe = '30d') => {
  const response = await api.get(`/api/users/${userId}/anomalies/stats`, {
    params: { timeframe }
  });
  return response.data;
};

// POST - Resolve an anomaly (mark as handled)
export const resolveAnomaly = async (userId, anomalyId, resolutionNotes) => {
  const response = await api.post(`/api/users/${userId}/anomalies/${anomalyId}/resolve`, {
    resolvedAt: new Date().toISOString(),
    notes: resolutionNotes
  });
  return response.data;
};