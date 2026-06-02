-- Workshop Attendance Management System
-- PostgreSQL Schema

-- Admins
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teachers
CREATE TABLE IF NOT EXISTS teachers (
    id SERIAL PRIMARY KEY,
    roll_number VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    school_name VARCHAR(300) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions (12 total: 4 days × 3 sessions)
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    day_number INTEGER NOT NULL CHECK (day_number BETWEEN 1 AND 4),
    session_number INTEGER NOT NULL CHECK (session_number BETWEEN 1 AND 3),
    session_topic VARCHAR(500) DEFAULT '',
    status VARCHAR(10) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Active', 'Closed')),
    activated_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    UNIQUE (day_number, session_number)
);

-- Attendance
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    status VARCHAR(10) NOT NULL DEFAULT 'Present' CHECK (status IN ('Present', 'Late', 'Absent')),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (teacher_id, session_id)
);

-- Attendance change log
CREATE TABLE IF NOT EXISTS attendance_log (
    id SERIAL PRIMARY KEY,
    attendance_id INTEGER REFERENCES attendance(id) ON DELETE CASCADE,
    old_status VARCHAR(10),
    new_status VARCHAR(10),
    changed_by INTEGER REFERENCES admins(id),
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed 12 sessions
INSERT INTO sessions (day_number, session_number, session_topic, status)
VALUES
    (1, 1, 'Introduction to AI', 'Pending'),
    (1, 2, 'Machine Learning Basics', 'Pending'),
    (1, 3, 'Hands-on: Python Setup', 'Pending'),
    (2, 1, 'Deep Learning Fundamentals', 'Pending'),
    (2, 2, 'Neural Networks Workshop', 'Pending'),
    (2, 3, 'Hands-on: Model Training', 'Pending'),
    (3, 1, 'AI in Education', 'Pending'),
    (3, 2, 'Coding with AI Tools', 'Pending'),
    (3, 3, 'Hands-on: Classroom AI', 'Pending'),
    (4, 1, 'Ethics in AI', 'Pending'),
    (4, 2, 'Future of AI & Teaching', 'Pending'),
    (4, 3, 'Capstone & Certificates', 'Pending')
ON CONFLICT (day_number, session_number) DO NOTHING;
