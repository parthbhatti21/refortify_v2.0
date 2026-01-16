-- User Logs Table for Reportify Application
-- Run this SQL in your NEW Supabase project's SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- Insert default users (add your 4 users here)

-- Create user_logs table
CREATE TABLE IF NOT EXISTS user_logs (
    id BIGSERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    event_type TEXT NOT NULL,
    event_category TEXT NOT NULL,
    event_details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    session_id TEXT,
    report_id TEXT,
    step_number INTEGER,
    section_name TEXT,
    error_code TEXT,
    error_message TEXT,
    stack_trace TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_user_logs_username ON user_logs(username);
CREATE INDEX IF NOT EXISTS idx_user_logs_event_type ON user_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_user_logs_event_category ON user_logs(event_category);
CREATE INDEX IF NOT EXISTS idx_user_logs_created_at ON user_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_logs_report_id ON user_logs(report_id);
CREATE INDEX IF NOT EXISTS idx_user_logs_session_id ON user_logs(session_id);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_user_logs_username_created_at ON user_logs(username, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_logs_category_type ON user_logs(event_category, event_type);

-- Add comments for documentation
COMMENT ON TABLE user_logs IS 'Stores all user activity logs for the Reportify application';
COMMENT ON COLUMN user_logs.username IS 'Username of the user performing the action';
COMMENT ON COLUMN user_logs.event_type IS 'Specific event type (e.g., login_success, extraction_started)';
COMMENT ON COLUMN user_logs.event_category IS 'High-level category (auth, extraction, report, step, image, autosave, pdf, error)';
COMMENT ON COLUMN user_logs.event_details IS 'Additional JSON data specific to the event';
COMMENT ON COLUMN user_logs.report_id IS 'ID of the report being worked on (if applicable)';
COMMENT ON COLUMN user_logs.step_number IS 'Step number (1-10) for step navigation events';
COMMENT ON COLUMN user_logs.section_name IS 'Section name for image uploads and other section-specific events';

-- Enable Row Level Security
ALTER TABLE user_logs ENABLE ROW LEVEL Security;

-- Create policy to allow anyone to insert logs (we'll validate username exists in users table)
CREATE POLICY "Anyone can insert logs" ON user_logs
    FOR INSERT
    WITH CHECK (true);

-- Create policy to allow anyone to read logs (you can restrict this later)
CREATE POLICY "Anyone can read logs" ON user_logs
    FOR SELECT
    USING (true);

-- Optional: Create a view for recent activity
CREATE OR REPLACE VIEW recent_user_activity AS
SELECT 
    username,
    event_category,
    event_type,
    report_id,
    step_number,
    section_name,
    created_at
FROM user_logs
ORDER BY created_at DESC
LIMIT 100;

-- Optional: Create a function to clean up old logs (older than 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM user_logs
    WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: Create a function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(p_username TEXT, p_days INTEGER DEFAULT 30)
RETURNS TABLE(
    total_logins BIGINT,
    total_reports_created BIGINT,
    total_steps_completed BIGINT,
    total_images_uploaded BIGINT,
    total_pdfs_generated BIGINT,
    total_errors BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) FILTER (WHERE event_type = 'login_success') as total_logins,
        COUNT(*) FILTER (WHERE event_type = 'report_creation_completed') as total_reports_created,
        COUNT(*) FILTER (WHERE event_type = 'step_completed') as total_steps_completed,
        COUNT(*) FILTER (WHERE event_type = 'image_uploaded') as total_images_uploaded,
        COUNT(*) FILTER (WHERE event_type = 'pdf_generation_success') as total_pdfs_generated,
        COUNT(*) FILTER (WHERE event_category = 'error') as total_errors
    FROM user_logs
    WHERE username = p_username
    AND created_at > NOW() - (p_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;
