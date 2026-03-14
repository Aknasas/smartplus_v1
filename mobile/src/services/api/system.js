// mobile/src/services/api/system.js
import api from './client';

export const healthCheck = () => api.get('/health').then(res => res.data);

export const testDB = () => api.get('/test-db').then(res => res.data);

export const getDBInfo = () => api.get('/api/db-info').then(res => res.data);

export const createSampleUsers = () => api.get('/api/create-sample-users').then(res => res.data);