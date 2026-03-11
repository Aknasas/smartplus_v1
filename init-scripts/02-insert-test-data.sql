-- ========== CLEAR EXISTING DATA ==========
TRUNCATE TABLE health_metrics CASCADE;
TRUNCATE TABLE anomalies CASCADE;
TRUNCATE TABLE emergency_alerts CASCADE;
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE health_targets CASCADE;
TRUNCATE TABLE reminders CASCADE;
TRUNCATE TABLE emergency_contacts CASCADE;
TRUNCATE TABLE patient_doctor CASCADE;
TRUNCATE TABLE patient_ambulance CASCADE;
TRUNCATE TABLE users CASCADE;

-- ========== 1. INSERT DOCTORS ==========
INSERT INTO users (username, password, email, role, name, phone, specialization, license_number, city) VALUES
('dr_silva', 'password123', 'dr.silva@hospital.lk', 'doctor', 'Dr. Kamal Silva', '+94771234501', 'Cardiologist', 'LIC001', 'Colombo'),
('dr_perera', 'password123', 'dr.perera@hospital.lk', 'doctor', 'Dr. Nimali Perera', '+94771234502', 'General Practitioner', 'LIC002', 'Colombo'),
('dr_fernando', 'password123', 'dr.fernando@hospital.lk', 'doctor', 'Dr. Ruwan Fernando', '+94771234503', 'Neurologist', 'LIC003', 'Kandy');

-- ========== 2. INSERT AMBULANCE SERVICES ==========
INSERT INTO users (username, password, email, role, name, phone, service_area, vehicle_number, city) VALUES
('amb_colombo', 'password123', 'dispatch@colombo-ambulance.lk', 'ambulance_service', 'Colombo City Ambulance', '+94112345601', 'Colombo Metro', 'AMB-001', 'Colombo'),
('amb_kandy', 'password123', 'dispatch@kandy-ambulance.lk', 'ambulance_service', 'Kandy Regional Ambulance', '+94812345601', 'Kandy District', 'AMB-002', 'Kandy'),
('amb_galle', 'password123', 'dispatch@galle-ambulance.lk', 'ambulance_service', 'Galle Emergency Services', '+94912345601', 'Galle District', 'AMB-003', 'Galle');

-- ========== 3. INSERT EMERGENCY CONTACTS ==========
INSERT INTO users (username, password, email, role, name, phone, city) VALUES
('emma_wilson', 'password123', 'emma.wilson@email.com', 'emergency_contact', 'Emma Wilson', '+94771234511', 'Colombo'),
('mike_brown', 'password123', 'mike.brown@email.com', 'emergency_contact', 'Mike Brown', '+94771234512', 'Colombo'),
('susan_davis', 'password123', 'susan.davis@email.com', 'emergency_contact', 'Susan Davis', '+94771234513', 'Kandy'),
('tom_smith', 'password123', 'tom.smith@email.com', 'emergency_contact', 'Tom Smith', '+94771234514', 'Colombo'),
('james_doe', 'password123', 'james.doe@email.com', 'emergency_contact', 'James Doe', '+94771234515', 'Colombo'),
('lisa_fernando', 'password123', 'lisa.fernando@email.com', 'emergency_contact', 'Lisa Fernando', '+94771234516', 'Kandy');

-- ========== 4. INSERT PATIENTS ==========
-- Patient 1: John Doe (Colombo)
INSERT INTO users (username, password, email, role, name, phone, address, city, blood_type, allergies, chronic_conditions, current_medications) VALUES
('john_doe', 'password123', 'john.doe@email.com', 'patient', 'John Doe', '+94771234601', '123 Main St, Colombo 3', 'Colombo', 'O+', 'Penicillin', 'Asthma', 'Ventolin inhaler');

-- Patient 2: Jane Smith (Colombo)
INSERT INTO users (username, password, email, role, name, phone, address, city, blood_type, allergies, chronic_conditions, current_medications) VALUES
('jane_smith', 'password123', 'jane.smith@email.com', 'patient', 'Jane Smith', '+94771234602', '456 Park Ave, Colombo 5', 'Colombo', 'A-', 'None', 'Hypertension', 'Lisinopril 10mg');

-- Patient 3: Bob Wilson (Kandy)
INSERT INTO users (username, password, email, role, name, phone, address, city, blood_type, allergies, chronic_conditions, current_medications) VALUES
('bob_wilson', 'password123', 'bob.wilson@email.com', 'patient', 'Bob Wilson', '+94771234603', '789 Temple Rd, Kandy', 'Kandy', 'B+', 'Sulfa drugs', 'Diabetes Type 2', 'Metformin 500mg');

-- ========== 5. ASSIGN DOCTORS TO PATIENTS ==========
-- John Doe -> Dr. Silva (Cardiologist)
INSERT INTO patient_doctor (patient_id, doctor_id) VALUES
((SELECT user_id FROM users WHERE username = 'john_doe'),
 (SELECT user_id FROM users WHERE username = 'dr_silva'));

-- Jane Smith -> Dr. Perera (GP)
INSERT INTO patient_doctor (patient_id, doctor_id) VALUES
((SELECT user_id FROM users WHERE username = 'jane_smith'),
 (SELECT user_id FROM users WHERE username = 'dr_perera'));

-- Bob Wilson -> Dr. Perera (GP)
INSERT INTO patient_doctor (patient_id, doctor_id) VALUES
((SELECT user_id FROM users WHERE username = 'bob_wilson'),
 (SELECT user_id FROM users WHERE username = 'dr_perera'));

-- ========== 6. ASSIGN AMBULANCE SERVICES TO PATIENTS ==========
-- John Doe (Colombo) -> Colombo City Ambulance
INSERT INTO patient_ambulance (patient_id, ambulance_id) VALUES
((SELECT user_id FROM users WHERE username = 'john_doe'),
 (SELECT user_id FROM users WHERE username = 'amb_colombo'));

-- Jane Smith (Colombo) -> Colombo City Ambulance
INSERT INTO patient_ambulance (patient_id, ambulance_id) VALUES
((SELECT user_id FROM users WHERE username = 'jane_smith'),
 (SELECT user_id FROM users WHERE username = 'amb_colombo'));

-- Bob Wilson (Kandy) -> Kandy Regional Ambulance
INSERT INTO patient_ambulance (patient_id, ambulance_id) VALUES
((SELECT user_id FROM users WHERE username = 'bob_wilson'),
 (SELECT user_id FROM users WHERE username = 'amb_kandy'));

-- ========== 7. ASSIGN EMERGENCY CONTACTS (EXACTLY 2 PER PATIENT) ==========
-- John Doe's Contacts
INSERT INTO emergency_contacts (patient_id, contact_number, name, relationship, phone, email, is_primary) VALUES
((SELECT user_id FROM users WHERE username = 'john_doe'), 1, 'Emma Wilson', 'spouse', '+94771234511', 'emma.wilson@email.com', true);

INSERT INTO emergency_contacts (patient_id, contact_number, name, relationship, phone, email, is_primary) VALUES
((SELECT user_id FROM users WHERE username = 'john_doe'), 2, 'James Doe', 'brother', '+94771234515', 'james.doe@email.com', false);

-- Jane Smith's Contacts
INSERT INTO emergency_contacts (patient_id, contact_number, name, relationship, phone, email, is_primary) VALUES
((SELECT user_id FROM users WHERE username = 'jane_smith'), 1, 'Tom Smith', 'spouse', '+94771234514', 'tom.smith@email.com', true);

INSERT INTO emergency_contacts (patient_id, contact_number, name, relationship, phone, email, is_primary) VALUES
((SELECT user_id FROM users WHERE username = 'jane_smith'), 2, 'Mike Brown', 'friend', '+94771234512', 'mike.brown@email.com', false);

-- Bob Wilson's Contacts
INSERT INTO emergency_contacts (patient_id, contact_number, name, relationship, phone, email, is_primary) VALUES
((SELECT user_id FROM users WHERE username = 'bob_wilson'), 1, 'Susan Davis', 'sister', '+94771234513', 'susan.davis@email.com', true);

INSERT INTO emergency_contacts (patient_id, contact_number, name, relationship, phone, email, is_primary) VALUES
((SELECT user_id FROM users WHERE username = 'bob_wilson'), 2, 'Lisa Fernando', 'neighbor', '+94771234516', 'lisa.fernando@email.com', false);

-- ========== 8. INSERT SAMPLE HEALTH METRICS ==========
-- Heart rate for John Doe (last 24 hours)
INSERT INTO health_metrics (time, user_id, metric_type, value, unit)
SELECT
    NOW() - (n * INTERVAL '1 hour'),
    (SELECT user_id FROM users WHERE username = 'john_doe'),
    'heart_rate',
    70 + (random() * 20 - 10)::int,
    'bpm'
FROM generate_series(0, 23) n;

-- Steps for John Doe (last 7 days)
INSERT INTO health_metrics (time, user_id, metric_type, value, unit)
SELECT
    NOW() - (n * INTERVAL '1 day'),
    (SELECT user_id FROM users WHERE username = 'john_doe'),
    'steps',
    7500 + (random() * 2500)::int,
    'count'
FROM generate_series(0, 6) n;

-- ========== 9. INSERT ANOMALIES ==========
INSERT INTO anomalies (user_id, metric_type, actual_value, severity, is_resolved) VALUES
((SELECT user_id FROM users WHERE username = 'john_doe'), 'heart_rate', 145, 'high', true),
((SELECT user_id FROM users WHERE username = 'jane_smith'), 'heart_rate', 48, 'low', true),
((SELECT user_id FROM users WHERE username = 'bob_wilson'), 'blood_oxygen', 92, 'medium', false);

-- ========== 10. INSERT EMERGENCY ALERTS ==========
INSERT INTO emergency_alerts (patient_id, alert_type, severity, status, latitude, longitude, heart_rate, blood_oxygen) VALUES
((SELECT user_id FROM users WHERE username = 'john_doe'), 'fall', 'critical', 'resolved', 6.9271, 79.8612, 145, 96),
((SELECT user_id FROM users WHERE username = 'jane_smith'), 'panic_button', 'high', 'acknowledged', 6.9100, 79.8700, 118, 98),
((SELECT user_id FROM users WHERE username = 'bob_wilson'), 'anomaly', 'medium', 'active', 7.2906, 80.6337, NULL, 92);

-- ========== 11. INSERT NOTIFICATIONS ==========
INSERT INTO notifications (user_id, type, title, message, is_read) VALUES
((SELECT user_id FROM users WHERE username = 'john_doe'), 'alert', 'Fall Detected', 'A fall was detected. Emergency contacts notified.', true),
((SELECT user_id FROM users WHERE username = 'jane_smith'), 'reminder', 'Medication Reminder', 'Time to take your Lisinopril', false),
((SELECT user_id FROM users WHERE username = 'bob_wilson'), 'alert', 'Low Blood Oxygen', 'Your SpO₂ is below normal range', false);

-- ========== 12. INSERT HEALTH TARGETS ==========
INSERT INTO health_targets (user_id, target_type, target_value, current_value) VALUES
((SELECT user_id FROM users WHERE username = 'john_doe'), 'steps', 10000, 8542),
((SELECT user_id FROM users WHERE username = 'jane_smith'), 'heart_rate', 75, 72),
((SELECT user_id FROM users WHERE username = 'bob_wilson'), 'blood_oxygen', 98, 96);

-- ========== 13. INSERT REMINDERS ==========
INSERT INTO reminders (user_id, reminder_type, title, scheduled_time) VALUES
((SELECT user_id FROM users WHERE username = 'john_doe'), 'medication', 'Take Asthma Inhaler', NOW() + INTERVAL '2 hours'),
((SELECT user_id FROM users WHERE username = 'jane_smith'), 'medication', 'Take Lisinopril', NOW() + INTERVAL '1 hour'),
((SELECT user_id FROM users WHERE username = 'bob_wilson'), 'measurement', 'Check Blood Sugar', NOW() + INTERVAL '3 hours');

-- ========== 14. VERIFICATION QUERIES ==========
-- Show all patients with their assigned doctor
SELECT
    p.name as patient_name,
    p.city as patient_city,
    d.name as doctor_name,
    d.specialization
FROM patient_doctor pd
JOIN users p ON pd.patient_id = p.user_id
JOIN users d ON pd.doctor_id = d.user_id;

-- Show all patients with their assigned ambulance
SELECT
    p.name as patient_name,
    p.city as patient_city,
    a.name as ambulance_service,
    a.service_area
FROM patient_ambulance pa
JOIN users p ON pa.patient_id = p.user_id
JOIN users a ON pa.ambulance_id = a.user_id;

-- Show all patients with their 2 emergency contacts
SELECT
    p.name as patient_name,
    ec.contact_number,
    ec.name as contact_name,
    ec.relationship,
    ec.phone,
    ec.is_primary
FROM emergency_contacts ec
JOIN users p ON ec.patient_id = p.user_id
ORDER BY p.name, ec.contact_number;

-- Summary counts
SELECT 'Patients: ' || COUNT(*) FROM users WHERE role = 'patient'
UNION ALL
SELECT 'Doctors: ' || COUNT(*) FROM users WHERE role = 'doctor'
UNION ALL
SELECT 'Ambulance Services: ' || COUNT(*) FROM users WHERE role = 'ambulance_service'
UNION ALL
SELECT 'Emergency Contacts: ' || COUNT(*) FROM users WHERE role = 'emergency_contact'
UNION ALL
SELECT 'Emergency Contact Links: ' || COUNT(*) FROM emergency_contacts;