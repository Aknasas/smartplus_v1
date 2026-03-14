// mobile/src/services/index.js

// CORRECT - import from the api folder
export { default as apiClient } from './api/client';  // Changed from './client' to './api/client'

export * from './api/auth';
export * from './api/users';
export * from './api/metrics';
export * from './api/anomalies';
export * from './api/emergency';
export * from './api/reminders';
export * from './api/targets';
export * from './api/system';

// Export types
export * from './types';