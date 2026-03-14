// mobile/src/services/api/metrics.js
import api from './client';

export const getMetrics = async (
  userId,
  options?: { metric_type?: string; limit?: number; days?: number }
) => {
  const params: any = { limit: options?.limit || 100 };
  if (options?.metric_type) params.metric_type = options.metric_type;
  if (options?.days) params.days = options.days;

  const response = await api.get(`/api/users/${userId}/metrics`, { params });
  return response.data;
};

export const addMetric = async (metric: {
  patient_id: string;
  metric_type: string;
  value: number;
  unit: string;
  device_id?: string;
  finger_detected?: boolean;
  notes?: string;
}) => {
  const response = await api.post('/api/metrics', metric);
  return response.data;
};