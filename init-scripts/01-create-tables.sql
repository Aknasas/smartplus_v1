-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Enable TimescaleDB
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- ========== ENUM TYPES ==========
CREATE TYPE user_role AS ENUM (
    'patient',
    'doctor',
    'emergency_contact',
    'ambulance_service',
    'admin'
);

-- ========== USERS TABLE ==========
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL,

    -- Personal Information
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),

    -- Role-specific fields
    specialization VARCHAR(255),  -- For doctors
    license_number VARCHAR(100),  -- For doctors
    service_area VARCHAR(255),    -- For ambulance service
    vehicle_number VARCHAR(50),   -- For ambulance service

    -- Account Management
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Patient-specific medical info
    blood_type VARCHAR(5),
    allergies TEXT,
    chronic_conditions TEXT,
    current_medications TEXT
);

-- ========== PATIENT_DOCTOR (One-to-One) ==========
CREATE TABLE patient_doctor (
    patient_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    assigned_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true,

    CONSTRAINT fk_patient FOREIGN KEY (patient_id) REFERENCES users(user_id),
    CONSTRAINT fk_doctor FOREIGN KEY (doctor_id) REFERENCES users(user_id)
);

-- ========== PATIENT_AMBULANCE (One-to-One) ==========
CREATE TABLE patient_ambulance (
    patient_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    ambulance_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    assigned_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true,

    CONSTRAINT fk_patient_amb FOREIGN KEY (patient_id) REFERENCES users(user_id),
    CONSTRAINT fk_ambulance FOREIGN KEY (ambulance_id) REFERENCES users(user_id)
);

-- ========== EMERGENCY_CONTACTS (Exactly 2 per patient) ==========
CREATE TABLE emergency_contacts (
    contact_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,

    -- Contact 1 or 2
    contact_number INTEGER NOT NULL CHECK (contact_number IN (1, 2)),

    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20),
    email VARCHAR(255),

    is_primary BOOLEAN DEFAULT false,
    can_receive_alerts BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Ensure exactly 2 contacts per patient
    UNIQUE(patient_id, contact_number)
);

-- ========== HEALTH METRICS TABLE ==========
CREATE TABLE health_metrics (
    time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    unit VARCHAR(20),
    device_id VARCHAR(100),
    PRIMARY KEY (time, user_id, metric_type)
);

-- Convert to hypertable
SELECT create_hypertable('health_metrics', 'time');

-- ========== ANOMALIES TABLE ==========
CREATE TABLE anomalies (
    anomaly_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    detected_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    metric_type VARCHAR(50) NOT NULL,
    actual_value DOUBLE PRECISION,
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    is_resolved BOOLEAN DEFAULT false
);

-- ========== EMERGENCY ALERTS TABLE ==========
CREATE TABLE emergency_alerts (
    alert_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',

    -- Location
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),

    -- Health data at time of alert
    heart_rate INTEGER,
    blood_oxygen INTEGER,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP,
    resolved_at TIMESTAMP
);

-- ========== NOTIFICATIONS TABLE ==========
CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ========== HEALTH TARGETS TABLE ==========
CREATE TABLE health_targets (
    target_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    target_type VARCHAR(50) NOT NULL,
    target_value DOUBLE PRECISION NOT NULL,
    current_value DOUBLE PRECISION DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- ========== REMINDERS TABLE ==========
CREATE TABLE reminders (
    reminder_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    reminder_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    scheduled_time TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- ========== CREATE INDEXES ==========
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_city ON users(city);
CREATE INDEX idx_health_metrics_user_time ON health_metrics(user_id, time DESC);
CREATE INDEX idx_emergency_alerts_status ON emergency_alerts(status) WHERE status = 'active';