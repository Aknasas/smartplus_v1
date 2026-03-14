-- ========== CLEAR EXISTING DATA (in correct order) ==========
TRUNCATE TABLE feedback CASCADE;
TRUNCATE TABLE activity_logs CASCADE;
TRUNCATE TABLE user_achievements CASCADE;
TRUNCATE TABLE health_recommendations CASCADE;
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE reminders CASCADE;
TRUNCATE TABLE emergency_alerts CASCADE;
TRUNCATE TABLE anomalies CASCADE;
TRUNCATE TABLE acceleration_data CASCADE;
TRUNCATE TABLE health_metrics CASCADE;
TRUNCATE TABLE patient_stats CASCADE;
TRUNCATE TABLE health_targets CASCADE;
TRUNCATE TABLE patient_ambulance_assignments CASCADE;
TRUNCATE TABLE patient_doctor_assignments CASCADE;
TRUNCATE TABLE emergency_contacts CASCADE;
TRUNCATE TABLE ambulance_services CASCADE;
TRUNCATE TABLE doctors CASCADE;
TRUNCATE TABLE patients CASCADE;
TRUNCATE TABLE users CASCADE;

-- ========== 1. INSERT BASE USERS ==========

-- Patients
INSERT INTO users (user_id, username, password, email, role, first_name, last_name, phone, profile_image_url, is_active, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'john_doe', '$2a$12$6i2ZWYBvYgDAF8DqxJUwle/iuLy3hlpqXfwbjXNqbLyMmEdFMg5Gu', 'john.doe@email.com', 'patient', 'John', 'Doe', '+94771234601', 'https://ui-avatars.com/api/?name=John+Doe&background=42A5F5&color=fff', true, NOW() - INTERVAL '30 days'),
('22222222-2222-2222-2222-222222222222', 'jane_smith', '$2a$12$6i2ZWYBvYgDAF8DqxJUwle/iuLy3hlpqXfwbjXNqbLyMmEdFMg5Gu', 'jane.smith@email.com', 'patient', 'Jane', 'Smith', '+94771234602', 'https://ui-avatars.com/api/?name=Jane+Smith&background=66BB6A&color=fff', true, NOW() - INTERVAL '45 days'),
('33333333-3333-3333-3333-333333333333', 'bob_wilson', '$2a$12$6i2ZWYBvYgDAF8DqxJUwle/iuLy3hlpqXfwbjXNqbLyMmEdFMg5Gu', 'bob.wilson@email.com', 'patient', 'Bob', 'Wilson', '+94771234603', 'https://ui-avatars.com/api/?name=Bob+Wilson&background=FFA726&color=fff', true, NOW() - INTERVAL '60 days'),
('44444444-4444-4444-4444-444444444444', 'mary_jones', '$2a$12$6i2ZWYBvYgDAF8DqxJUwle/iuLy3hlpqXfwbjXNqbLyMmEdFMg5Gu', 'mary.jones@email.com', 'patient', 'Mary', 'Jones', '+94771234604', 'https://ui-avatars.com/api/?name=Mary+Jones&background=AB47BC&color=fff', true, NOW() - INTERVAL '15 days'),
('55555555-5555-5555-5555-555555555555', 'david_brown', '$2a$12$6i2ZWYBvYgDAF8DqxJUwle/iuLy3hlpqXfwbjXNqbLyMmEdFMg5Gu', 'david.brown@email.com', 'patient', 'David', 'Brown', '+94771234605', 'https://ui-avatars.com/api/?name=David+Brown&background=EF5350&color=fff', true, NOW() - INTERVAL '20 days');

-- Doctors
INSERT INTO users (user_id, username, password, email, role, first_name, last_name, phone, profile_image_url, is_active, created_at) VALUES
('66666666-6666-6666-6666-666666666666', 'dr_silva', '$2a$12$6i2ZWYBvYgDAF8DqxJUwle/iuLy3hlpqXfwbjXNqbLyMmEdFMg5Gu', 'dr.silva@hospital.lk', 'doctor', 'Kamal', 'Silva', '+94771234501', 'https://ui-avatars.com/api/?name=Dr+Kamal+Silva&background=42A5F5&color=fff', true, NOW() - INTERVAL '365 days'),
('77777777-7777-7777-7777-777777777777', 'dr_perera', '$2a$12$6i2ZWYBvYgDAF8DqxJUwle/iuLy3hlpqXfwbjXNqbLyMmEdFMg5Gu', 'dr.perera@hospital.lk', 'doctor', 'Nimali', 'Perera', '+94771234502', 'https://ui-avatars.com/api/?name=Dr+Nimali+Perera&background=66BB6A&color=fff', true, NOW() - INTERVAL '400 days'),
('88888888-8888-8888-8888-888888888888', 'dr_fernando', '$2a$12$6i2ZWYBvYgDAF8DqxJUwle/iuLy3hlpqXfwbjXNqbLyMmEdFMg5Gu', 'dr.fernando@hospital.lk', 'doctor', 'Ruwan', 'Fernando', '+94771234503', 'https://ui-avatars.com/api/?name=Dr+Ruwan+Fernando&background=FFA726&color=fff', true, NOW() - INTERVAL '300 days');

-- Ambulance Services
INSERT INTO users (user_id, username, password, email, role, first_name, last_name, phone, profile_image_url, is_active, created_at) VALUES
('99999999-9999-9999-9999-999999999999', 'amb_colombo', '$2a$12$6i2ZWYBvYgDAF8DqxJUwle/iuLy3hlpqXfwbjXNqbLyMmEdFMg5Gu', 'dispatch@colombo-ambulance.lk', 'ambulance_service', 'Colombo City', 'Ambulance', '+94112345601', 'https://ui-avatars.com/api/?name=Colombo+Ambulance&background=EF5350&color=fff', true, NOW() - INTERVAL '500 days'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'amb_kandy', '$2a$12$6i2ZWYBvYgDAF8DqxJUwle/iuLy3hlpqXfwbjXNqbLyMmEdFMg5Gu', 'dispatch@kandy-ambulance.lk', 'ambulance_service', 'Kandy Regional', 'Ambulance', '+94812345601', 'https://ui-avatars.com/api/?name=Kandy+Ambulance&background=FFA726&color=fff', true, NOW() - INTERVAL '450 days'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'amb_galle', '$2a$12$6i2ZWYBvYgDAF8DqxJUwle/iuLy3hlpqXfwbjXNqbLyMmEdFMg5Gu', 'dispatch@galle-ambulance.lk', 'ambulance_service', 'Galle Emergency', 'Services', '+94912345601', 'https://ui-avatars.com/api/?name=Galle+Emergency&background=66BB6A&color=fff', true, NOW() - INTERVAL '400 days');

-- Emergency Contacts (as users)
INSERT INTO users (user_id, username, password, email, role, first_name, last_name, phone, profile_image_url, is_active) VALUES
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'emma_wilson', '$2a$12$6i2ZWYBvYgDAF8DqxJUwle/iuLy3hlpqXfwbjXNqbLyMmEdFMg5Gu', 'emma.wilson@email.com', 'emergency_contact', 'Emma', 'Wilson', '+94771234511', 'https://ui-avatars.com/api/?name=Emma+Wilson&background=AB47BC&color=fff', true),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'mike_brown', '$2a$12$6i2ZWYBvYgDAF8DqxJUwle/iuLy3hlpqXfwbjXNqbLyMmEdFMg5Gu', 'mike.brown@email.com', 'emergency_contact', 'Mike', 'Brown', '+94771234512', 'https://ui-avatars.com/api/?name=Mike+Brown&background=42A5F5&color=fff', true),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'susan_davis', '$2a$12$6i2ZWYBvYgDAF8DqxJUwle/iuLy3hlpqXfwbjXNqbLyMmEdFMg5Gu', 'susan.davis@email.com', 'emergency_contact', 'Susan', 'Davis', '+94771234513', 'https://ui-avatars.com/api/?name=Susan+Davis&background=66BB6A&color=fff', true),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'tom_smith', '$2a$12$6i2ZWYBvYgDAF8DqxJUwle/iuLy3hlpqXfwbjXNqbLyMmEdFMg5Gu', 'tom.smith@email.com', 'emergency_contact', 'Tom', 'Smith', '+94771234514', 'https://ui-avatars.com/api/?name=Tom+Smith&background=FFA726&color=fff', true),
('11111111-2222-3333-4444-555555555555', 'james_doe', '$2a$12$6i2ZWYBvYgDAF8DqxJUwle/iuLy3hlpqXfwbjXNqbLyMmEdFMg5Gu', 'james.doe@email.com', 'emergency_contact', 'James', 'Doe', '+94771234515', 'https://ui-avatars.com/api/?name=James+Doe&background=EF5350&color=fff', true),
('22222222-3333-4444-5555-666666666666', 'lisa_fernando', '$2a$12$6i2ZWYBvYgDAF8DqxJUwle/iuLy3hlpqXfwbjXNqbLyMmEdFMg5Gu', 'lisa.fernando@email.com', 'emergency_contact', 'Lisa', 'Fernando', '+94771234516', 'https://ui-avatars.com/api/?name=Lisa+Fernando&background=AB47BC&color=fff', true);

-- ========== 2. INSERT PATIENTS ==========

-- John Doe
INSERT INTO patients (
    patient_id, date_of_birth, gender, blood_type, height_cm, weight_kg,
    address, city, medical_conditions, allergies, current_medications,
    emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
    notification_enabled, email_alerts, sound_enabled, vibration_enabled,
    quiet_hours_enabled, quiet_hours_start, quiet_hours_end,
    biometric_auth, two_factor_auth, auto_logout, data_encryption, cloud_backup,
    activity_logs, emergency_access, share_anonymized_data,
    registration_completed, registration_date, avatar_url
) VALUES (
    '11111111-1111-1111-1111-111111111111', '1985-03-15', 'Male', 'O+', 178.5, 82.3,
    '123 Main St, Colombo 3', 'Colombo', 'Asthma, Hypertension', 'Penicillin', 'Lisinopril 10mg, Ventolin inhaler',
    'Emma Wilson', '+94771234511', 'Spouse',
    true, true, true, true,
    true, '22:00', '07:00',
    true, false, true, true, true,
    true, true, false,
    true, NOW() - INTERVAL '30 days', 'https://ui-avatars.com/api/?name=John+Doe&background=42A5F5&color=fff'
);

-- Jane Smith
INSERT INTO patients (
    patient_id, date_of_birth, gender, blood_type, height_cm, weight_kg,
    address, city, medical_conditions, allergies, current_medications,
    emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
    notification_enabled, email_alerts, sound_enabled, vibration_enabled,
    quiet_hours_enabled, quiet_hours_start, quiet_hours_end,
    biometric_auth, two_factor_auth, auto_logout, data_encryption, cloud_backup,
    activity_logs, emergency_access, share_anonymized_data,
    registration_completed, registration_date, avatar_url
) VALUES (
    '22222222-2222-2222-2222-222222222222', '1990-07-22', 'Female', 'A-', 165.0, 62.5,
    '456 Park Ave, Colombo 5', 'Colombo', 'Hypothyroidism', 'None', 'Levothyroxine 50mcg',
    'Tom Smith', '+94771234514', 'Spouse',
    true, true, true, true,
    false, '23:00', '06:00',
    true, false, true, true, true,
    true, true, true,
    true, NOW() - INTERVAL '45 days', 'https://ui-avatars.com/api/?name=Jane+Smith&background=66BB6A&color=fff'
);

-- Bob Wilson
INSERT INTO patients (
    patient_id, date_of_birth, gender, blood_type, height_cm, weight_kg,
    address, city, medical_conditions, allergies, current_medications,
    emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
    notification_enabled, email_alerts, sound_enabled, vibration_enabled,
    quiet_hours_enabled, quiet_hours_start, quiet_hours_end,
    biometric_auth, two_factor_auth, auto_logout, data_encryption, cloud_backup,
    activity_logs, emergency_access, share_anonymized_data,
    registration_completed, registration_date, avatar_url
) VALUES (
    '33333333-3333-3333-3333-333333333333', '1978-11-10', 'Male', 'B+', 182.0, 88.7,
    '789 Temple Rd, Kandy', 'Kandy', 'Diabetes Type 2, Coronary Artery Disease', 'Sulfa drugs', 'Metformin 500mg, Aspirin 81mg',
    'Susan Davis', '+94771234513', 'Sister',
    true, false, true, true,
    true, '21:00', '06:30',
    true, true, true, true, true,
    true, true, false,
    true, NOW() - INTERVAL '60 days', 'https://ui-avatars.com/api/?name=Bob+Wilson&background=FFA726&color=fff'
);

-- Mary Jones
INSERT INTO patients (
    patient_id, date_of_birth, gender, blood_type, height_cm, weight_kg,
    address, city, medical_conditions, allergies, current_medications,
    emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
    notification_enabled, email_alerts, sound_enabled, vibration_enabled,
    quiet_hours_enabled, quiet_hours_start, quiet_hours_end,
    biometric_auth, two_factor_auth, auto_logout, data_encryption, cloud_backup,
    activity_logs, emergency_access, share_anonymized_data,
    registration_completed, registration_date, avatar_url
) VALUES (
    '44444444-4444-4444-4444-444444444444', '1982-09-05', 'Female', 'AB+', 170.2, 70.1,
    '321 Beach Rd, Galle', 'Galle', 'Migraine, Anxiety', 'Latex', 'Sumatriptan as needed, Escitalopram 10mg',
    'Lisa Fernando', '+94771234516', 'Friend',
    true, true, true, true,
    true, '22:30', '07:30',
    true, false, true, true, true,
    true, true, true,
    true, NOW() - INTERVAL '15 days', 'https://ui-avatars.com/api/?name=Mary+Jones&background=AB47BC&color=fff'
);

-- David Brown
INSERT INTO patients (
    patient_id, date_of_birth, gender, blood_type, height_cm, weight_kg,
    address, city, medical_conditions, allergies, current_medications,
    emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
    notification_enabled, email_alerts, sound_enabled, vibration_enabled,
    quiet_hours_enabled, quiet_hours_start, quiet_hours_end,
    biometric_auth, two_factor_auth, auto_logout, data_encryption, cloud_backup,
    activity_logs, emergency_access, share_anonymized_data,
    registration_completed, registration_date, avatar_url
) VALUES (
    '55555555-5555-5555-5555-555555555555', '1988-12-18', 'Male', 'O-', 175.8, 79.2,
    '567 Lake Rd, Kandy', 'Kandy', 'Seasonal Allergies', 'Pollen, Dust', 'Cetirizine 10mg as needed',
    'James Doe', '+94771234515', 'Brother',
    true, false, true, true,
    false, '23:30', '07:00',
    true, false, true, true, true,
    true, true, false,
    true, NOW() - INTERVAL '20 days', 'https://ui-avatars.com/api/?name=David+Brown&background=EF5350&color=fff'
);

-- ========== 3. INSERT DOCTORS ==========
INSERT INTO doctors (doctor_id, specialization, license_number, hospital, clinic_address, city, consultation_fee, years_experience, available_for_emergency, rating, total_reviews) VALUES
('66666666-6666-6666-6666-666666666666', 'Cardiologist', 'LIC001', 'Colombo General Hospital', '123 Hospital Rd, Colombo', 'Colombo', 2500.00, 15, true, 4.8, 342),
('77777777-7777-7777-7777-777777777777', 'General Practitioner', 'LIC002', 'Colombo Medical Center', '456 Health Ave, Colombo', 'Colombo', 1500.00, 8, true, 4.5, 256),
('88888888-8888-8888-8888-888888888888', 'Neurologist', 'LIC003', 'Kandy General Hospital', '789 Medical St, Kandy', 'Kandy', 3000.00, 12, false, 4.9, 189);

-- ========== 4. INSERT AMBULANCE SERVICES ==========
INSERT INTO ambulance_services (ambulance_id, service_name, service_area, vehicle_number, vehicle_type, latitude, longitude, is_available, estimated_response_time, contact_number, alternate_contact, rating, total_responses) VALUES
('99999999-9999-9999-9999-999999999999', 'Colombo City Ambulance', 'Colombo Metro', 'AMB-001', 'advanced', 6.9271, 79.8612, true, 8, '+94112345601', '+94112345602', 4.7, 1523),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Kandy Regional Ambulance', 'Kandy District', 'AMB-002', 'basic', 7.2906, 80.6337, true, 12, '+94812345601', '+94812345602', 4.5, 876),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Galle Emergency Services', 'Galle District', 'AMB-003', 'icu', 6.0535, 80.2210, true, 10, '+94912345601', '+94912345602', 4.6, 654);

-- ========== 5. INSERT PATIENT-DOCTOR ASSIGNMENTS ==========
INSERT INTO patient_doctor_assignments (patient_id, doctor_id, is_primary, is_active) VALUES
('11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', true, true), -- John -> Dr. Silva (Cardiologist)
('11111111-1111-1111-1111-111111111111', '77777777-7777-7777-7777-777777777777', false, true), -- John -> Dr. Perera (GP)
('22222222-2222-2222-2222-222222222222', '77777777-7777-7777-7777-777777777777', true, true), -- Jane -> Dr. Perera (GP)
('33333333-3333-3333-3333-333333333333', '77777777-7777-7777-7777-777777777777', true, true), -- Bob -> Dr. Perera (GP)
('33333333-3333-3333-3333-333333333333', '88888888-8888-8888-8888-888888888888', false, true), -- Bob -> Dr. Fernando (Neurologist)
('44444444-4444-4444-4444-444444444444', '77777777-7777-7777-7777-777777777777', true, true), -- Mary -> Dr. Perera (GP)
('55555555-5555-5555-5555-555555555555', '77777777-7777-7777-7777-777777777777', true, true); -- David -> Dr. Perera (GP)

-- ========== 6. INSERT PATIENT-AMBULANCE ASSIGNMENTS ==========
INSERT INTO patient_ambulance_assignments (patient_id, ambulance_id, is_preferred, is_active) VALUES
('11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', true, true), -- John -> Colombo
('22222222-2222-2222-2222-222222222222', '99999999-9999-9999-9999-999999999999', true, true), -- Jane -> Colombo
('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true, true), -- Bob -> Kandy
('44444444-4444-4444-4444-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', true, true), -- Mary -> Galle
('55555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true, true); -- David -> Kandy

-- ========== 7. INSERT EMERGENCY CONTACTS ==========

-- John Doe's Contacts
INSERT INTO emergency_contacts (patient_id, name, relationship, phone, alternate_phone, email, is_primary, can_receive_alerts) VALUES
('11111111-1111-1111-1111-111111111111', 'Emma Wilson', 'spouse', '+94771234511', '+94771234512', 'emma.wilson@email.com', true, true),
('11111111-1111-1111-1111-111111111111', 'James Doe', 'brother', '+94771234515', NULL, 'james.doe@email.com', false, true);

-- Jane Smith's Contacts
INSERT INTO emergency_contacts (patient_id, name, relationship, phone, alternate_phone, email, is_primary, can_receive_alerts) VALUES
('22222222-2222-2222-2222-222222222222', 'Tom Smith', 'spouse', '+94771234514', NULL, 'tom.smith@email.com', true, true),
('22222222-2222-2222-2222-222222222222', 'Mike Brown', 'friend', '+94771234512', '+94771234513', 'mike.brown@email.com', false, true);

-- Bob Wilson's Contacts
INSERT INTO emergency_contacts (patient_id, name, relationship, phone, alternate_phone, email, is_primary, can_receive_alerts) VALUES
('33333333-3333-3333-3333-333333333333', 'Susan Davis', 'sister', '+94771234513', NULL, 'susan.davis@email.com', true, true),
('33333333-3333-3333-3333-333333333333', 'Lisa Fernando', 'neighbor', '+94771234516', NULL, 'lisa.fernando@email.com', false, true);

-- Mary Jones's Contacts
INSERT INTO emergency_contacts (patient_id, name, relationship, phone, alternate_phone, email, is_primary, can_receive_alerts) VALUES
('44444444-4444-4444-4444-444444444444', 'Lisa Fernando', 'friend', '+94771234516', NULL, 'lisa.fernando@email.com', true, true),
('44444444-4444-4444-4444-444444444444', 'Mike Brown', 'brother', '+94771234512', NULL, 'mike.brown@email.com', false, true);

-- David Brown's Contacts
INSERT INTO emergency_contacts (patient_id, name, relationship, phone, alternate_phone, email, is_primary, can_receive_alerts) VALUES
('55555555-5555-5555-5555-555555555555', 'James Doe', 'brother', '+94771234515', NULL, 'james.doe@email.com', true, true),
('55555555-5555-5555-5555-555555555555', 'Emma Wilson', 'sister', '+94771234511', NULL, 'emma.wilson@email.com', false, true);

-- ========== 8. INSERT HEALTH TARGETS ==========
INSERT INTO health_targets (patient_id, target_type, target_value, target_min_value, target_max_value, current_value, unit, icon, color, is_active) VALUES
-- John Doe
('11111111-1111-1111-1111-111111111111', 'steps', 10000, NULL, NULL, 8542, 'count', 'walking', '#42A5F5', true),
('11111111-1111-1111-1111-111111111111', 'heart_rate', NULL, 60, 100, 75, 'bpm', 'heartbeat', '#EF5350', true),
('11111111-1111-1111-1111-111111111111', 'calories', 600, NULL, NULL, 450, 'kcal', 'fire', '#FF6B6B', true),
('11111111-1111-1111-1111-111111111111', 'sleep', 8, NULL, NULL, 7, 'hours', 'bed', '#AB47BC', true),
('11111111-1111-1111-1111-111111111111', 'distance', 8, NULL, NULL, 5.6, 'km', 'map-marker', '#66BB6A', true),
('11111111-1111-1111-1111-111111111111', 'active_minutes', 60, NULL, NULL, 35, 'min', 'clock-o', '#FFA726', true),

-- Jane Smith
('22222222-2222-2222-2222-222222222222', 'steps', 8000, NULL, NULL, 7234, 'count', 'walking', '#42A5F5', true),
('22222222-2222-2222-2222-222222222222', 'heart_rate', NULL, 55, 95, 72, 'bpm', 'heartbeat', '#EF5350', true),
('22222222-2222-2222-2222-222222222222', 'calories', 500, NULL, NULL, 380, 'kcal', 'fire', '#FF6B6B', true),

-- Bob Wilson
('33333333-3333-3333-3333-333333333333', 'steps', 7000, NULL, NULL, 5231, 'count', 'walking', '#42A5F5', true),
('33333333-3333-3333-3333-333333333333', 'heart_rate', NULL, 50, 120, 82, 'bpm', 'heartbeat', '#EF5350', true),
('33333333-3333-3333-3333-333333333333', 'spo2', NULL, 95, 100, 96, '%', 'tint', '#66BB6A', true),

-- Mary Jones
('44444444-4444-4444-4444-444444444444', 'steps', 9000, NULL, NULL, 8210, 'count', 'walking', '#42A5F5', true),
('44444444-4444-4444-4444-444444444444', 'heart_rate', NULL, 58, 98, 68, 'bpm', 'heartbeat', '#EF5350', true),

-- David Brown
('55555555-5555-5555-5555-555555555555', 'steps', 10000, NULL, NULL, 3456, 'count', 'walking', '#42A5F5', true),
('55555555-5555-5555-5555-555555555555', 'heart_rate', NULL, 60, 100, 82, 'bpm', 'heartbeat', '#EF5350', true);

-- ========== 9. INSERT HEALTH METRICS (Time-series data) ==========

-- Function to generate random health metrics
DO $$
DECLARE
    patient_rec RECORD;
    base_time TIMESTAMPTZ;
    heart_rate_val INTEGER;
    spo2_val INTEGER;
    temp_val DECIMAL(3,1);
    steps_val INTEGER;
    calories_val DECIMAL(6,2);
    distance_val DECIMAL(4,2);
BEGIN
    FOR patient_rec IN SELECT patient_id FROM patients LOOP
        -- Generate data for last 30 days
        FOR day_offset IN 0..29 LOOP
            base_time = NOW() - (day_offset * INTERVAL '1 day');

            -- Hourly metrics for last 24 hours (for each day)
            FOR hour_offset IN 0..23 LOOP
                -- Heart rate (varies throughout the day)
                heart_rate_val = 60 + (random() * 30)::INTEGER;
                IF hour_offset BETWEEN 0 AND 5 THEN -- Sleep
                    heart_rate_val = 50 + (random() * 15)::INTEGER;
                ELSIF hour_offset BETWEEN 7 AND 9 THEN -- Morning activity
                    heart_rate_val = 70 + (random() * 25)::INTEGER;
                ELSIF hour_offset BETWEEN 17 AND 19 THEN -- Evening activity
                    heart_rate_val = 75 + (random() * 30)::INTEGER;
                END IF;

                -- Add some anomalies for Bob Wilson
                IF patient_rec.patient_id = '33333333-3333-3333-3333-333333333333' AND day_offset < 5 AND random() < 0.1 THEN
                    heart_rate_val = 115 + (random() * 20)::INTEGER; -- High heart rate
                END IF;

                INSERT INTO health_metrics (time, patient_id, metric_type, value, unit, device_id, finger_detected)
                VALUES (
                    base_time - (hour_offset * INTERVAL '1 hour'),
                    patient_rec.patient_id,
                    'heart_rate',
                    heart_rate_val,
                    'bpm',
                    'ESP32_DEVICE_001',
                    CASE WHEN random() < 0.9 THEN true ELSE false END
                );

                -- SpO2 (normally 95-100)
                spo2_val = 95 + (random() * 5)::INTEGER;
                IF random() < 0.05 THEN
                    spo2_val = 88 + (random() * 6)::INTEGER; -- Low SpO2 anomaly
                END IF;

                INSERT INTO health_metrics (time, patient_id, metric_type, value, unit, device_id, finger_detected)
                VALUES (
                    base_time - (hour_offset * INTERVAL '1 hour'),
                    patient_rec.patient_id,
                    'spo2',
                    spo2_val,
                    '%',
                    'ESP32_DEVICE_001',
                    CASE WHEN random() < 0.9 THEN true ELSE false END
                );

                -- Temperature
                temp_val = 36.0 + (random() * 1.5)::DECIMAL(3,1);
                INSERT INTO health_metrics (time, patient_id, metric_type, value, unit, device_id)
                VALUES (
                    base_time - (hour_offset * INTERVAL '1 hour'),
                    patient_rec.patient_id,
                    'temperature',
                    temp_val,
                    '°C',
                    'ESP32_DEVICE_001'
                );
            END LOOP;

            -- Daily steps (only for the main time of the day)
            steps_val = 5000 + (random() * 6000)::INTEGER;
            calories_val = 300 + (random() * 400)::DECIMAL(6,2);
            distance_val = 3.0 + (random() * 6.0)::DECIMAL(4,2);

            INSERT INTO health_metrics (time, patient_id, metric_type, value, unit, device_id)
            VALUES (
                base_time + INTERVAL '12 hours',
                patient_rec.patient_id,
                'steps',
                steps_val,
                'count',
                'ESP32_DEVICE_001'
            );

            INSERT INTO health_metrics (time, patient_id, metric_type, value, unit, device_id)
            VALUES (
                base_time + INTERVAL '12 hours',
                patient_rec.patient_id,
                'calories',
                calories_val,
                'kcal',
                'ESP32_DEVICE_001'
            );

            INSERT INTO health_metrics (time, patient_id, metric_type, value, unit, device_id)
            VALUES (
                base_time + INTERVAL '12 hours',
                patient_rec.patient_id,
                'distance',
                distance_val,
                'km',
                'ESP32_DEVICE_001'
            );

            -- Sleep hours (approx)
            INSERT INTO health_metrics (time, patient_id, metric_type, value, unit, device_id)
            VALUES (
                base_time + INTERVAL '23 hours',
                patient_rec.patient_id,
                'sleep',
                6.0 + (random() * 3.0)::DECIMAL(3,1),
                'hours',
                'ESP32_DEVICE_001'
            );
        END LOOP;
    END LOOP;
END $$;

-- ========== 10. INSERT ACCELERATION DATA ==========
INSERT INTO acceleration_data (time, patient_id, x_axis, y_axis, z_axis, activity_detected, step_detected, fall_detected, tremor_detected)
SELECT
    NOW() - (n * INTERVAL '1 minute'),
    '11111111-1111-1111-1111-111111111111',
    (random() * 2 - 1)::DECIMAL(6,3),
    (random() * 2 - 1)::DECIMAL(6,3),
    (random() * 2 - 1)::DECIMAL(6,3),
    CASE
        WHEN random() < 0.3 THEN 'Walking'::activity_level
        WHEN random() < 0.5 THEN 'Light Activity'::activity_level
        WHEN random() < 0.7 THEN 'Running'::activity_level
        ELSE 'Inactive'::activity_level
    END,
    CASE WHEN random() < 0.1 THEN true ELSE false END,
    CASE WHEN random() < 0.01 THEN true ELSE false END, -- 1% chance of fall detection
    CASE WHEN random() < 0.02 THEN true ELSE false END -- 2% chance of tremor detection
FROM generate_series(0, 1440) n
WHERE n % 10 = 0; -- Every 10 minutes for 24 hours

-- Add a specific fall event for John Doe
INSERT INTO acceleration_data (time, patient_id, x_axis, y_axis, z_axis, activity_detected, fall_detected)
VALUES (
    NOW() - INTERVAL '2 days' + INTERVAL '2 hours',
    '11111111-1111-1111-1111-111111111111',
    3.2, 2.8, 4.5,
    'Running'::activity_level,
    true
);

-- ========== 11. INSERT ANOMALIES ==========
INSERT INTO anomalies (patient_id, detected_at, metric_type, metric_value, expected_range_min, expected_range_max, severity, level, is_resolved, notes) VALUES
-- John Doe
('11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '5 days', 'heart_rate', 145, 60, 100, 'high', 'Critical', true, 'Tachycardia episode - resolved with medication'),
('11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '12 days', 'heart_rate', 48, 60, 100, 'low', 'Warning', true, 'Bradycardia during sleep'),

-- Jane Smith
('22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '3 days', 'heart_rate', 118, 55, 95, 'medium', 'Warning', false, 'Elevated heart rate - monitoring'),

-- Bob Wilson
('33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '1 day', 'spo2', 88, 95, 100, 'high', 'Critical', false, 'Low blood oxygen - needs monitoring'),
('33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '4 days', 'heart_rate', 122, 50, 120, 'medium', 'Warning', true, 'Heart rate spike after exercise'),
('33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '7 days', 'blood_pressure_systolic', 145, 90, 130, 'medium', 'Warning', true, 'High blood pressure reading'),

-- Mary Jones
('44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '2 days', 'temperature', 38.5, 36, 38, 'medium', 'Warning', true, 'Mild fever - resolved'),

-- David Brown
('55555555-5555-5555-5555-555555555555', NOW() - INTERVAL '1 day', 'heart_rate', 115, 60, 100, 'medium', 'Warning', false, 'Elevated heart rate after exercise');

-- ========== 12. INSERT EMERGENCY ALERTS ==========
INSERT INTO emergency_alerts (
    patient_id, alert_type, severity, level, status,
    latitude, longitude, location_address,
    heart_rate, blood_oxygen, temperature,
    created_at, acknowledged_at, resolved_at, response_time_minutes,
    notes
) VALUES
-- John Doe - Fall detected
(
    '11111111-1111-1111-1111-111111111111',
    'fall', 'critical', 'Critical', 'resolved',
    6.9271, 79.8612, '123 Main St, Colombo 3',
    145, 96, 36.8,
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '10 days' + INTERVAL '2 minutes',
    NOW() - INTERVAL '10 days' + INTERVAL '15 minutes',
    2.0,
    'Fall detected in bathroom - emergency contacts notified'
),
-- Jane Smith - Panic button
(
    '22222222-2222-2222-2222-222222222222',
    'panic_button', 'high', 'Warning', 'acknowledged',
    6.9100, 79.8700, '456 Park Ave, Colombo 5',
    118, 98, 36.6,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days' + INTERVAL '1 minute',
    NULL,
    1.0,
    'Patient pressed panic button - called to check'
),
-- Bob Wilson - Low SpO2 anomaly
(
    '33333333-3333-3333-3333-333333333333',
    'anomaly', 'medium', 'Warning', 'active',
    7.2906, 80.6337, '789 Temple Rd, Kandy',
    98, 88, 37.2,
    NOW() - INTERVAL '1 day',
    NULL,
    NULL,
    NULL,
    'Low SpO2 alert - monitoring'
),
-- John Doe - Heart rate spike
(
    '11111111-1111-1111-1111-111111111111',
    'heart_rate_spike', 'high', 'Critical', 'resolved',
    6.9271, 79.8612, '123 Main St, Colombo 3',
    156, 97, 36.9,
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '15 days' + INTERVAL '3 minutes',
    NOW() - INTERVAL '15 days' + INTERVAL '30 minutes',
    3.0,
    'Heart rate spike detected - patient resting'
),
-- Bob Wilson - Fall detection (false alarm)
(
    '33333333-3333-3333-3333-333333333333',
    'fall', 'medium', 'False', 'false_alarm',
    7.2906, 80.6337, '789 Temple Rd, Kandy',
    82, 96, 36.5,
    NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '8 days' + INTERVAL '1 minute',
    NOW() - INTERVAL '8 days' + INTERVAL '5 minutes',
    1.0,
    'False alarm - dropped phone'
),
-- Mary Jones - Panic button
(
    '44444444-4444-4444-4444-444444444444',
    'panic_button', 'high', 'Warning', 'resolved',
    6.0535, 80.2210, '321 Beach Rd, Galle',
    102, 97, 36.7,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days' + INTERVAL '1 minute',
    NOW() - INTERVAL '3 days' + INTERVAL '10 minutes',
    1.0,
    'Accidental panic button press'
);

-- ========== 13. INSERT NOTIFICATIONS ==========
INSERT INTO notifications (user_id, type, priority, title, message, is_read, action_type, action_screen, metadata, created_at) VALUES
-- John Doe
('11111111-1111-1111-1111-111111111111', 'alert', 'critical', 'Fall Detected', 'A fall was detected. Emergency contacts notified.', true, 'navigate', 'EmergencyAlerts', '{"alert_id": "1"}', NOW() - INTERVAL '10 days'),
('11111111-1111-1111-1111-111111111111', 'reminder', 'medium', 'Medication Reminder', 'Time to take your Lisinopril', false, 'snooze', NULL, NULL, NOW() - INTERVAL '2 hours'),
('11111111-1111-1111-1111-111111111111', 'health', 'low', 'Daily Health Summary', 'Your daily health score is 85/100. Great job!', true, NULL, NULL, NULL, NOW() - INTERVAL '1 day'),
('11111111-1111-1111-1111-111111111111', 'achievement', 'medium', 'New Achievement Unlocked!', 'You reached 10,000 steps for 7 consecutive days', true, NULL, NULL, NULL, NOW() - INTERVAL '3 days'),

-- Jane Smith
('22222222-2222-2222-2222-222222222222', 'alert', 'high', 'Panic Button Pressed', 'Emergency alert acknowledged', true, 'navigate', 'EmergencyAlerts', '{"alert_id": "2"}', NOW() - INTERVAL '5 days'),
('22222222-2222-2222-2222-222222222222', 'reminder', 'medium', 'Medication Reminder', 'Time to take your Levothyroxine', false, 'snooze', NULL, NULL, NOW() - INTERVAL '3 hours'),
('22222222-2222-2222-2222-222222222222', 'health', 'low', 'Weekly Health Summary', 'You walked 45,000 steps this week', true, NULL, NULL, NULL, NOW() - INTERVAL '2 days'),

-- Bob Wilson
('33333333-3333-3333-3333-333333333333', 'alert', 'high', 'Low Blood Oxygen', 'Your SpO₂ is below normal range', false, 'navigate', 'EmergencyAlerts', '{"anomaly_id": "3"}', NOW() - INTERVAL '1 day'),
('33333333-3333-3333-3333-333333333333', 'alert', 'medium', 'False Alarm', 'Fall detection was a false alarm', true, NULL, NULL, NULL, NOW() - INTERVAL '8 days'),
('33333333-3333-3333-3333-333333333333', 'reminder', 'high', 'Blood Sugar Test', 'Fasting required - morning test', false, 'snooze', NULL, NULL, NOW() + INTERVAL '12 hours'),

-- Mary Jones
('44444444-4444-4444-4444-444444444444', 'alert', 'high', 'Panic Button Pressed', 'Emergency services alerted', true, 'navigate', 'EmergencyAlerts', '{"alert_id": "6"}', NOW() - INTERVAL '3 days'),
('44444444-4444-4444-4444-444444444444', 'info', 'low', 'Weekly Summary', 'Your health summary for this week is ready', true, NULL, NULL, NULL, NOW() - INTERVAL '1 day'),

-- David Brown
('55555555-5555-5555-5555-555555555555', 'reminder', 'medium', 'Take Allergy Medicine', 'Time to take your Cetirizine', false, 'snooze', NULL, NULL, NOW() - INTERVAL '1 hour'),
('55555555-5555-5555-5555-555555555555', 'system', 'low', 'App Update Available', 'Version 1.2.0 is ready to install', false, 'navigate', 'Settings', NULL, NOW() - INTERVAL '2 days');

-- ========== 14. INSERT REMINDERS ==========
INSERT INTO reminders (patient_id, reminder_type, title, description, scheduled_datetime, extra_info, color, is_recurring, recurrence_pattern, is_active, is_completed) VALUES
-- John Doe
('11111111-1111-1111-1111-111111111111', 'Medicine Intake', 'Take Blood Pressure Medicine', 'Take after breakfast', NOW() + INTERVAL '2 hours', 'Lisinopril, 10mg', '#42A5F5', true, 'daily', true, false),
('11111111-1111-1111-1111-111111111111', 'Doctor Appointment', 'Cardiology Check-up', 'Regular heart check-up', NOW() + INTERVAL '5 days', 'Dr. Silva at Colombo General Hospital', '#66BB6A', false, NULL, true, false),
('11111111-1111-1111-1111-111111111111', 'Exercise', 'Morning Walk', '30 minutes brisk walking', NOW() + INTERVAL '1 day' + INTERVAL '7 hours', 'Park near home', '#AB47BC', true, 'daily', true, false),

-- Jane Smith
('22222222-2222-2222-2222-222222222222', 'Medicine Intake', 'Take Thyroid Medication', 'Take on empty stomach', NOW() + INTERVAL '3 hours', 'Levothyroxine 50mcg', '#42A5F5', true, 'daily', true, false),
('22222222-2222-2222-2222-222222222222', 'Lab Test', 'Blood Work', 'Fasting required - 12 hours', NOW() + INTERVAL '2 days' + INTERVAL '8 hours', 'City Medical Lab', '#FFA726', false, NULL, true, false),

-- Bob Wilson
('33333333-3333-3333-3333-333333333333', 'Medicine Intake', 'Take Diabetes Medication', 'Take with meals', NOW() + INTERVAL '1 hour', 'Metformin 500mg', '#42A5F5', true, 'daily', true, false),
('33333333-3333-3333-3333-333333333333', 'Medication Refill', 'Refill Prescriptions', 'Pick up from pharmacy', NOW() + INTERVAL '3 days', 'Metformin, Aspirin', '#EF5350', false, NULL, true, false),
('33333333-3333-3333-3333-333333333333', 'Measurement', 'Check Blood Sugar', 'Fasting required', NOW() + INTERVAL '1 day' + INTERVAL '7 hours', 'Target: < 120 mg/dL', '#FFA726', true, 'daily', true, false),

-- Mary Jones
('44444444-4444-4444-4444-444444444444', 'Medicine Intake', 'Take Anxiety Medication', 'Take with food', NOW() + INTERVAL '4 hours', 'Escitalopram 10mg', '#42A5F5', true, 'daily', true, false),
('44444444-4444-4444-4444-444444444444', 'Exercise', 'Yoga Session', '30 minutes yoga', NOW() + INTERVAL '1 day' + INTERVAL '9 hours', 'Bring mat', '#AB47BC', true, 'daily', true, false),

-- David Brown
('55555555-5555-5555-5555-555555555555', 'Medicine Intake', 'Take Allergy Medicine', 'Take as needed for allergies', NOW() + INTERVAL '6 hours', 'Cetirizine 10mg', '#42A5F5', false, NULL, true, false),
('55555555-5555-5555-5555-555555555555', 'Doctor Appointment', 'Allergist Appointment', 'Discuss seasonal allergies', NOW() + INTERVAL '7 days', 'Dr. Perera at Colombo Medical Center', '#66BB6A', false, NULL, true, false);

-- ========== 15. INSERT HEALTH RECOMMENDATIONS ==========
INSERT INTO health_recommendations (patient_id, category, icon, color, tip, priority, is_high_priority, is_completed, created_at) VALUES
-- John Doe
('11111111-1111-1111-1111-111111111111', 'Nutrition & Diet', 'apple', '#66BB6A', 'Increase daily water intake to 2-3 liters', 3, false, false, NOW() - INTERVAL '10 days'),
('11111111-1111-1111-1111-111111111111', 'Exercise & Activity', 'running', '#42A5F5', 'Aim for 150 minutes of moderate exercise weekly', 5, true, false, NOW() - INTERVAL '10 days'),
('11111111-1111-1111-1111-111111111111', 'Sleep & Rest', 'bed', '#AB47BC', 'Maintain consistent sleep schedule (7-8 hours)', 4, false, false, NOW() - INTERVAL '10 days'),
('11111111-1111-1111-1111-111111111111', 'Stress Management', 'heartbeat', '#FFA726', 'Practice 10 minutes of daily meditation', 3, false, false, NOW() - INTERVAL '10 days'),

-- Jane Smith
('22222222-2222-2222-2222-222222222222', 'Nutrition & Diet', 'apple', '#66BB6A', 'Include more leafy greens in your meals', 3, false, true, NOW() - INTERVAL '15 days'),
('22222222-2222-2222-2222-222222222222', 'Exercise & Activity', 'running', '#42A5F5', 'Take walking breaks every hour if sedentary', 4, true, false, NOW() - INTERVAL '15 days'),
('22222222-2222-2222-2222-222222222222', 'Health Monitoring', 'stethoscope', '#EF5350', 'Check blood pressure weekly', 5, true, false, NOW() - INTERVAL '15 days'),

-- Bob Wilson
('33333333-3333-3333-3333-333333333333', 'Nutrition & Diet', 'apple', '#66BB6A', 'Reduce processed sugar consumption', 5, true, false, NOW() - INTERVAL '20 days'),
('33333333-3333-3333-3333-333333333333', 'Exercise & Activity', 'running', '#42A5F5', 'Include strength training twice a week', 4, true, false, NOW() - INTERVAL '20 days'),
('33333333-3333-3333-3333-333333333333', 'Medication & Supplements', 'medkit', '#FFCA28', 'Take medications at same time daily', 5, true, false, NOW() - INTERVAL '20 days'),
('33333333-3333-3333-3333-333333333333', 'Health Monitoring', 'stethoscope', '#EF5350', 'Monitor glucose levels daily', 5, true, false, NOW() - INTERVAL '20 days'),

-- Mary Jones
('44444444-4444-4444-4444-444444444444', 'Stress Management', 'heartbeat', '#FFA726', 'Try deep breathing exercises', 4, true, false, NOW() - INTERVAL '8 days'),
('44444444-4444-4444-4444-444444444444', 'Sleep & Rest', 'bed', '#AB47BC', 'Avoid screens 1 hour before bedtime', 3, false, false, NOW() - INTERVAL '8 days'),

-- David Brown
('55555555-5555-5555-5555-555555555555', 'Health Monitoring', 'stethoscope', '#EF5350', 'Track daily step count', 3, false, false, NOW() - INTERVAL '5 days'),
('55555555-5555-5555-5555-555555555555', 'Exercise & Activity', 'running', '#42A5F5', 'Try morning yoga for flexibility', 2, false, false, NOW() - INTERVAL '5 days');

-- ========== 16. INSERT PATIENT STATS ==========
INSERT INTO patient_stats (patient_id, stat_date, health_score, steps, calories_burned, distance_km, active_minutes, sleep_hours, avg_heart_rate, avg_spo2, avg_temperature, weekly_progress, streak_days, goals_completed, total_readings)
SELECT
    patient_id,
    CURRENT_DATE - (n || ' days')::INTERVAL,
    70 + (random() * 25)::INTEGER,
    5000 + (random() * 6000)::INTEGER,
    300 + (random() * 400)::DECIMAL(8,2),
    3.0 + (random() * 6.0)::DECIMAL(5,2),
    15 + (random() * 45)::INTEGER,
    6.0 + (random() * 2.5)::DECIMAL(3,1),
    65 + (random() * 20)::INTEGER,
    94 + (random() * 5)::INTEGER,
    36.0 + (random() * 1.2)::DECIMAL(3,1),
    CASE WHEN random() < 0.3 THEN '+5%' WHEN random() < 0.6 THEN '+12%' ELSE '+8%' END,
    (random() * 30)::INTEGER,
    (random() * 20)::INTEGER,
    (random() * 500)::INTEGER
FROM patients
CROSS JOIN generate_series(0, 29) n
WHERE patient_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333')
ON CONFLICT (patient_id, stat_date) DO NOTHING;

-- ========== 17. INSERT USER ACHIEVEMENTS ==========
INSERT INTO user_achievements (patient_id, title, description, icon, unlocked_at, metadata) VALUES
('11111111-1111-1111-1111-111111111111', '7 Day Streak', 'Completed health goals for 7 consecutive days', 'fire', NOW() - INTERVAL '15 days', '{"streak": 7}'),
('11111111-1111-1111-1111-111111111111', 'Step Master', 'Reached 10,000 steps for 5 days', 'walking', NOW() - INTERVAL '10 days', '{"days": 5}'),
('22222222-2222-2222-2222-222222222222', 'Early Bird', 'Completed morning routine for 10 days', 'sun-o', NOW() - INTERVAL '20 days', '{"days": 10}'),
('33333333-3333-3333-3333-333333333333', 'Health Guardian', 'Monitored health data for 30 days', 'shield', NOW() - INTERVAL '25 days', '{"days": 30}'),
('44444444-4444-4444-4444-444444444444', 'Meditation Master', 'Meditated for 15 consecutive days', 'heart', NOW() - INTERVAL '5 days', '{"days": 15}');

-- ========== 18. INSERT ACTIVITY LOGS ==========
INSERT INTO activity_logs (user_id, action, ip_address, user_agent, timestamp)
SELECT
    user_id,
    CASE WHEN random() < 0.3 THEN 'LOGIN' WHEN random() < 0.6 THEN 'VIEW_HEALTH_METRICS' ELSE 'UPDATE_PROFILE' END,
    '192.168.1.' || (random() * 255)::INTEGER::TEXT,
    'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
    NOW() - (n || ' hours')::INTERVAL
FROM users
CROSS JOIN generate_series(1, 100) n
WHERE role = 'patient'
AND random() < 0.1;

-- ========== 19. INSERT FEEDBACK ==========
INSERT INTO feedback (user_id, feedback_text, is_bug_report, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'The app is great! Would love to see more exercise recommendations.', false, NOW() - INTERVAL '20 days'),
('22222222-2222-2222-2222-222222222222', 'App crashes sometimes when viewing heart rate graphs', true, NOW() - INTERVAL '15 days'),
('33333333-3333-3333-3333-333333333333', 'Excellent health monitoring features. Very accurate.', false, NOW() - INTERVAL '10 days'),
(NULL, 'Guest user feedback - considering registering', false, NOW() - INTERVAL '5 days');

-- ========== 20. VERIFICATION QUERIES ==========

-- Show summary counts
SELECT 'Users' as entity, COUNT(*) FROM users
UNION ALL
SELECT 'Patients', COUNT(*) FROM patients
UNION ALL
SELECT 'Doctors', COUNT(*) FROM doctors
UNION ALL
SELECT 'Ambulance Services', COUNT(*) FROM ambulance_services
UNION ALL
SELECT 'Emergency Contacts', COUNT(*) FROM emergency_contacts
UNION ALL
SELECT 'Health Metrics', COUNT(*) FROM health_metrics
UNION ALL
SELECT 'Acceleration Data', COUNT(*) FROM acceleration_data
UNION ALL
SELECT 'Anomalies', COUNT(*) FROM anomalies
UNION ALL
SELECT 'Emergency Alerts', COUNT(*) FROM emergency_alerts
UNION ALL
SELECT 'Notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'Reminders', COUNT(*) FROM reminders
UNION ALL
SELECT 'Health Targets', COUNT(*) FROM health_targets
UNION ALL
SELECT 'Recommendations', COUNT(*) FROM health_recommendations
UNION ALL
SELECT 'Patient Stats', COUNT(*) FROM patient_stats
UNION ALL
SELECT 'Achievements', COUNT(*) FROM user_achievements
ORDER BY entity;

-- Show patients with their primary doctors
SELECT
    p.first_name || ' ' || p.last_name as patient_name,
    p.city,
    d.first_name || ' ' || d.last_name as doctor_name,
    d.specialization,
    pda.is_primary
FROM patients p
JOIN patient_doctor_assignments pda ON p.patient_id = pda.patient_id
JOIN doctors d ON pda.doctor_id = d.doctor_id
WHERE pda.is_primary = true
ORDER BY p.last_name;

-- Show recent anomalies with patient names
SELECT
    u.first_name || ' ' || u.last_name as patient_name,
    a.metric_type,
    a.metric_value,
    a.severity,
    a.level,
    a.detected_at,
    a.is_resolved
FROM anomalies a
JOIN users u ON a.patient_id = u.user_id
WHERE a.detected_at > NOW() - INTERVAL '7 days'
ORDER BY a.detected_at DESC;

-- Show active emergency alerts
SELECT
    u.first_name || ' ' || u.last_name as patient_name,
    ea.alert_type,
    ea.severity,
    ea.level,
    ea.status,
    ea.created_at,
    ea.heart_rate,
    ea.blood_oxygen
FROM emergency_alerts ea
JOIN users u ON ea.patient_id = u.user_id
WHERE ea.status = 'active'
ORDER BY ea.created_at DESC;

-- Show today's reminders
SELECT
    u.first_name || ' ' || u.last_name as patient_name,
    r.reminder_type,
    r.title,
    r.scheduled_datetime,
    r.extra_info
FROM reminders r
JOIN users u ON r.patient_id = u.user_id
WHERE DATE(r.scheduled_datetime) = CURRENT_DATE
AND r.is_active = true
AND r.is_completed = false
ORDER BY r.scheduled_datetime;

-- Show patient health stats
SELECT
    u.first_name || ' ' || u.last_name as patient_name,
    ps.stat_date,
    ps.health_score,
    ps.steps,
    ps.sleep_hours,
    ps.avg_heart_rate
FROM patient_stats ps
JOIN users u ON ps.patient_id = u.user_id
WHERE ps.stat_date = CURRENT_DATE - INTERVAL '1 day'
ORDER BY ps.health_score DESC;

-- Show unread notifications count by user
SELECT
    u.first_name || ' ' || u.last_name as user_name,
    COUNT(*) as unread_count
FROM notifications n
JOIN users u ON n.user_id = u.user_id
WHERE n.is_read = false
GROUP BY u.user_id, u.first_name, u.last_name
ORDER BY unread_count DESC;

-- Show anomaly statistics by severity
SELECT
    severity,
    COUNT(*) as count,
    COUNT(CASE WHEN is_resolved THEN 1 END) as resolved,
    COUNT(CASE WHEN NOT is_resolved THEN 1 END) as unresolved
FROM anomalies
GROUP BY severity
ORDER BY
    CASE severity
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
    END;