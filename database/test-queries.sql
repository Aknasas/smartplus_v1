-- 1. HomeScreen Query
SELECT 
  u.name,
  u.email,
  COUNT(DISTINCT hm.metric_type) as active_metrics,
  COUNT(CASE WHEN a.is_resolved = false THEN 1 END) as pending_alerts
FROM users u
LEFT JOIN health_metrics hm ON u.user_id = hm.user_id 
  AND hm.time >= CURRENT_DATE - INTERVAL '1 day'
LEFT JOIN anomalies a ON u.user_id = a.user_id
GROUP BY u.user_id;

-- 2. HealthMonitoringScreen Query
SELECT 
  metric_type,
  ROUND(AVG(value), 2) as avg_value,
  MIN(value) as min_value,
  MAX(value) as max_value,
  COUNT(*) as readings
FROM health_metrics
WHERE time >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY metric_type;

-- 3. AnomalyDetectionScreen Query
SELECT 
  severity,
  COUNT(*) as count,
  ARRAY_AGG(metric_type) as affected_metrics
FROM anomalies
WHERE is_resolved = false
GROUP BY severity
ORDER BY 
  CASE severity 
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END;

-- 4. NotificationsScreen Query
SELECT 
  type,
  title,
  message,
  created_at,
  is_read
FROM notifications
ORDER BY created_at DESC;

-- 5. ProfileScreen Query
SELECT * FROM users;

-- 6. ProgressTrackingScreen Query
SELECT 
  DATE(time) as date,
  metric_type,
  ROUND(AVG(value), 2) as daily_avg
FROM health_metrics
WHERE time >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(time), metric_type
ORDER BY date DESC;

-- 7. Run all queries
-- Copy each query and run in pgAdmin Query Tool