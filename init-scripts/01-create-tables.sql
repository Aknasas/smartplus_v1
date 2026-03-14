-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Enable TimescaleDB for time-series data
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- ========== ENUM TYPES ==========
CREATE TYPE user_role AS ENUM (
    'patient',
    'doctor',
    'emergency_contact',
    'ambulance_service',
    'admin'
);

CREATE TYPE reminder_type AS ENUM (
    'Medicine Intake',
    'Doctor Appointment',
    'Lab Test',
    'Exercise',
    'Medication Refill',
    'Measurement',
    'General'
);

CREATE TYPE alert_type AS ENUM (
    'fall',
    'panic_button',
    'anomaly',
    'manual',
    'heart_rate_spike',
    'low_spo2',
    'high_blood_pressure',
    'irregular_heartbeat',
    'temperature_alert',
    'medication_missed',
    'sudden_movement',
    'respiratory_distress'
);

CREATE TYPE alert_severity AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);

CREATE TYPE alert_status AS ENUM (
    'active',
    'acknowledged',
    'resolved',
    'false_alarm',
    'successful'
);

CREATE TYPE notification_type AS ENUM (
    'alert',
    'reminder',
    'health',
    'emergency',
    'system',
    'achievement',
    'info',
    'warning'
);

CREATE TYPE gender_type AS ENUM (
    'Male',
    'Female',
    'Other',
    'Prefer not to say'
);

CREATE TYPE blood_type AS ENUM (
    'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown'
);

CREATE TYPE activity_level AS ENUM (
    'Inactive',
    'Light Activity',
    'Walking',
    'Running'
);

-- ========== USERS TABLE (Authentication) ==========
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    profile_image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ========== PATIENTS TABLE ==========
CREATE TABLE patients (
    patient_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    date_of_birth DATE,
    gender gender_type,
    blood_type blood_type,
    height_cm DECIMAL(5,1),
    weight_kg DECIMAL(5,1),
    address TEXT,
    city VARCHAR(100),

    -- Medical Information
    medical_conditions TEXT,
    allergies TEXT,
    current_medications TEXT,

    -- Emergency Contact
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),

    -- Preferences
    notification_enabled BOOLEAN DEFAULT true,
    email_alerts BOOLEAN DEFAULT false,
    sound_enabled BOOLEAN DEFAULT true,
    vibration_enabled BOOLEAN DEFAULT true,
    quiet_hours_enabled BOOLEAN DEFAULT false,
    quiet_hours_start TIME DEFAULT '22:00',
    quiet_hours_end TIME DEFAULT '07:00',

    -- Security Settings
    biometric_auth BOOLEAN DEFAULT true,
    two_factor_auth BOOLEAN DEFAULT false,
    auto_logout BOOLEAN DEFAULT true,
    data_encryption BOOLEAN DEFAULT true,
    cloud_backup BOOLEAN DEFAULT true,
    activity_logs BOOLEAN DEFAULT true,
    emergency_access BOOLEAN DEFAULT true,
    share_anonymized_data BOOLEAN DEFAULT false,

    registration_completed BOOLEAN DEFAULT false,
    registration_date TIMESTAMPTZ,
    avatar_url TEXT,

    FOREIGN KEY (patient_id) REFERENCES users(user_id)
);

-- ========== PATIENT_STATS (Daily/Monthly Stats) ==========
CREATE TABLE patient_stats (
    stat_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    stat_date DATE NOT NULL,
    health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
    steps INTEGER DEFAULT 0,
    calories_burned DECIMAL(8,2) DEFAULT 0,
    distance_km DECIMAL(5,2) DEFAULT 0,
    active_minutes INTEGER DEFAULT 0,
    sleep_hours DECIMAL(3,1) DEFAULT 0,
    avg_heart_rate INTEGER,
    avg_spo2 INTEGER,
    avg_temperature DECIMAL(3,1),
    weekly_progress VARCHAR(10),
    streak_days INTEGER DEFAULT 0,
    goals_completed INTEGER DEFAULT 0,
    total_readings INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(patient_id, stat_date)
);

-- ========== DOCTORS TABLE ==========
CREATE TABLE doctors (
    doctor_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    specialization VARCHAR(255) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    hospital VARCHAR(255),
    clinic_address TEXT,
    city VARCHAR(100),
    consultation_fee DECIMAL(10,2),
    years_experience INTEGER,
    available_for_emergency BOOLEAN DEFAULT true,
    rating DECIMAL(2,1),
    total_reviews INTEGER DEFAULT 0
);

-- ========== PATIENT_DOCTOR_ASSIGNMENT ==========
CREATE TABLE patient_doctor_assignments (
    assignment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    assigned_date DATE DEFAULT CURRENT_DATE,
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(patient_id, doctor_id)
);

-- ========== AMBULANCE_SERVICES TABLE ==========
CREATE TABLE ambulance_services (
    ambulance_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    service_name VARCHAR(255) NOT NULL,
    service_area VARCHAR(255) NOT NULL,
    vehicle_number VARCHAR(50) UNIQUE NOT NULL,
    vehicle_type VARCHAR(50), -- 'basic', 'advanced', 'icu'
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    is_available BOOLEAN DEFAULT true,
    estimated_response_time INTEGER, -- in minutes
    contact_number VARCHAR(20) NOT NULL,
    alternate_contact VARCHAR(20),
    rating DECIMAL(2,1),
    total_responses INTEGER DEFAULT 0
);

-- ========== PATIENT_AMBULANCE_ASSIGNMENT ==========
CREATE TABLE patient_ambulance_assignments (
    assignment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    ambulance_id UUID NOT NULL REFERENCES ambulance_services(ambulance_id) ON DELETE CASCADE,
    assigned_date DATE DEFAULT CURRENT_DATE,
    is_preferred BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true
);

-- ========== EMERGENCY_CONTACTS TABLE ==========
CREATE TABLE emergency_contacts (
    contact_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20),
    email VARCHAR(255),
    is_primary BOOLEAN DEFAULT false,
    can_receive_alerts BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ========== HEALTH_METRICS TABLE (Time-series) ==========
CREATE TABLE health_metrics (
    metric_id UUID DEFAULT uuid_generate_v4(),
    time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL, -- 'heart_rate', 'spo2', 'temperature', 'blood_pressure_systolic', 'blood_pressure_diastolic', 'steps', 'calories', 'distance', 'sleep'
    value DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20),
    device_id VARCHAR(100),
    finger_detected BOOLEAN, -- For sensors that require finger detection
    notes TEXT,
    PRIMARY KEY (metric_id, time)
);

-- Convert to hypertable for time-series optimization
SELECT create_hypertable('health_metrics', 'time');

-- ========== ACCELERATION_DATA TABLE (Motion tracking) ==========
CREATE TABLE acceleration_data (
    acceleration_id UUID DEFAULT uuid_generate_v4(),
    time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    x_axis DECIMAL(6,3) NOT NULL,
    y_axis DECIMAL(6,3) NOT NULL,
    z_axis DECIMAL(6,3) NOT NULL,
    magnitude DECIMAL(6,3) GENERATED ALWAYS AS (SQRT(x_axis*x_axis + y_axis*y_axis + z_axis*z_axis)) STORED,
    activity_detected activity_level,
    step_detected BOOLEAN DEFAULT false,
    fall_detected BOOLEAN DEFAULT false,
    tremor_detected BOOLEAN DEFAULT false,
    PRIMARY KEY (acceleration_id, time)
);

SELECT create_hypertable('acceleration_data', 'time');

-- ========== ANOMALIES TABLE ==========
CREATE TABLE anomalies (
    anomaly_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    detected_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    metric_type VARCHAR(50) NOT NULL,
    metric_value DECIMAL(10,2),
    expected_range_min DECIMAL(10,2),
    expected_range_max DECIMAL(10,2),
    severity alert_severity,
    level VARCHAR(20), -- 'Critical', 'Warning'
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ,
    notes TEXT
);

-- ========== EMERGENCY_ALERTS TABLE (FIXED - removed INDEX from CREATE TABLE) ==========
CREATE TABLE emergency_alerts (
    alert_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    alert_type alert_type NOT NULL,
    severity alert_severity NOT NULL,
    level VARCHAR(20), -- 'Critical', 'Warning', 'False'
    status alert_status DEFAULT 'active',
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    location_address TEXT,

    -- Health data at time of alert
    heart_rate INTEGER,
    blood_oxygen INTEGER,
    temperature DECIMAL(4,1),
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    acceleration_data JSONB, -- Store acceleration snapshot

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by UUID REFERENCES users(user_id),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(user_id),
    response_time_minutes DECIMAL(5,2), -- Time from creation to acknowledgment
    notes TEXT
);

-- ========== NOTIFICATIONS TABLE (FIXED - removed INDEX from CREATE TABLE) ==========
CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    priority VARCHAR(10) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    action_type VARCHAR(50), -- 'navigate', 'dismiss', 'snooze'
    action_screen VARCHAR(100),
    metadata JSONB, -- Additional data like anomaly_id, alert_id, etc.
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ
);

-- ========== REMINDERS TABLE (FIXED - removed INDEX from CREATE TABLE) ==========
CREATE TABLE reminders (
    reminder_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    reminder_type reminder_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ,
    extra_info TEXT, -- Medication dosage, location, etc.
    color VARCHAR(20) DEFAULT '#FFCA28',
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern VARCHAR(50), -- 'daily', 'weekly', 'monthly'
    recurrence_interval INTEGER,
    is_active BOOLEAN DEFAULT true,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    notification_sent BOOLEAN DEFAULT false
);

-- ========== HEALTH_TARGETS TABLE ==========
CREATE TABLE health_targets (
    target_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    target_type VARCHAR(50) NOT NULL, -- 'steps', 'heart_rate', 'spo2', 'temperature', 'calories', 'sleep', 'distance', 'active_minutes'
    target_value DECIMAL(10,2) NOT NULL,
    target_min_value DECIMAL(10,2),
    target_max_value DECIMAL(10,2),
    current_value DECIMAL(10,2) DEFAULT 0,
    unit VARCHAR(20),
    icon VARCHAR(50),
    color VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ========== HEALTH_RECOMMENDATIONS TABLE ==========
CREATE TABLE health_recommendations (
    recommendation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL, -- 'Nutrition & Diet', 'Exercise & Activity', 'Sleep & Rest', 'Stress Management', 'Health Monitoring', 'Medication & Supplements'
    icon VARCHAR(50),
    color VARCHAR(20),
    tip TEXT NOT NULL,
    priority INTEGER DEFAULT 1, -- Higher number = higher priority
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    is_high_priority BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ
);

-- ========== USER_ACHIEVEMENTS TABLE ==========
CREATE TABLE user_achievements (
    achievement_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    unlocked_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- ========== ACTIVITY_LOGS TABLE (Security) ==========
CREATE TABLE activity_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ========== FEEDBACK TABLE ==========
CREATE TABLE feedback (
    feedback_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    feedback_text TEXT NOT NULL,
    is_bug_report BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ========== CREATE INDEXES FOR PERFORMANCE (All indexes here, AFTER table creation) ==========
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_patients_city ON patients(city);
CREATE INDEX idx_patients_blood_type ON patients(blood_type);

CREATE INDEX idx_health_metrics_patient_time ON health_metrics(patient_id, time DESC);
CREATE INDEX idx_health_metrics_type_time ON health_metrics(metric_type, time DESC);

CREATE INDEX idx_acceleration_patient_time ON acceleration_data(patient_id, time DESC);
CREATE INDEX idx_acceleration_fall ON acceleration_data(patient_id, fall_detected, time DESC);

CREATE INDEX idx_anomalies_patient_resolved ON anomalies(patient_id, is_resolved, detected_at DESC);
CREATE INDEX idx_anomalies_severity ON anomalies(severity) WHERE NOT is_resolved;

CREATE INDEX idx_recommendations_patient ON health_recommendations(patient_id, is_completed, priority DESC);

CREATE INDEX idx_patient_stats_date ON patient_stats(patient_id, stat_date DESC);

-- Emergency Alerts indexes
CREATE INDEX idx_emergency_alerts_status ON emergency_alerts(status) WHERE status = 'active';
CREATE INDEX idx_emergency_alerts_patient_time ON emergency_alerts(patient_id, created_at DESC);

-- Notifications indexes
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read, created_at DESC);

-- Reminders indexes
CREATE INDEX idx_reminders_patient_scheduled ON reminders(patient_id, scheduled_datetime) WHERE is_active AND NOT is_completed;

-- ========== TRIGGER FUNCTIONS ==========

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON reminders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_targets_updated_at BEFORE UPDATE ON health_targets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update patient daily stats
CREATE OR REPLACE FUNCTION update_patient_daily_stats()
RETURNS TRIGGER AS $$
DECLARE
    today_date DATE;
    current_stats RECORD;
BEGIN
    today_date = DATE(NEW.time);

    -- Check if stats exist for today
    SELECT * INTO current_stats FROM patient_stats
    WHERE patient_id = NEW.patient_id AND stat_date = today_date;

    IF NOT FOUND THEN
        -- Insert new stats record
        INSERT INTO patient_stats (patient_id, stat_date)
        VALUES (NEW.patient_id, today_date);
    END IF;

    -- Update appropriate metric based on type
    IF NEW.metric_type = 'steps' THEN
        UPDATE patient_stats
        SET steps = steps + NEW.value::INTEGER
        WHERE patient_id = NEW.patient_id AND stat_date = today_date;
    ELSIF NEW.metric_type = 'calories' THEN
        UPDATE patient_stats
        SET calories_burned = calories_burned + NEW.value
        WHERE patient_id = NEW.patient_id AND stat_date = today_date;
    ELSIF NEW.metric_type = 'distance' THEN
        UPDATE patient_stats
        SET distance_km = distance_km + NEW.value
        WHERE patient_id = NEW.patient_id AND stat_date = today_date;
    END IF;

    -- Update total readings count
    UPDATE patient_stats
    SET total_readings = total_readings + 1
    WHERE patient_id = NEW.patient_id AND stat_date = today_date;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_patient_stats
    AFTER INSERT ON health_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_patient_daily_stats();

-- Function to create notification for anomalies
CREATE OR REPLACE FUNCTION create_anomaly_notification()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (
        user_id,
        type,
        priority,
        title,
        message,
        action_type,
        action_screen,
        metadata
    ) VALUES (
        NEW.patient_id,
        'alert',
        NEW.severity,
        CASE
            WHEN NEW.severity = 'critical' THEN 'Critical Health Anomaly Detected'
            ELSE 'Health Anomaly Detected'
        END,
        CASE
            WHEN NEW.severity = 'critical'
            THEN 'Immediate attention required: ' || NEW.metric_type || ' reading is ' || NEW.metric_value
            ELSE 'Your ' || NEW.metric_type || ' reading of ' || NEW.metric_value || ' is outside normal range'
        END,
        'navigate',
        'AnomalyDetection',
        jsonb_build_object('anomaly_id', NEW.anomaly_id, 'metric_type', NEW.metric_type)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_anomaly_notification
    AFTER INSERT ON anomalies
    FOR EACH ROW
    EXECUTE FUNCTION create_anomaly_notification();