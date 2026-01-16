-- Analytics Dashboard Queries for User Activity Logs
-- Use these queries to build dashboards and gain insights

-- ============================================
-- USER ACTIVITY OVERVIEW
-- ============================================

-- Daily Active Users (Last 30 days)
SELECT 
    DATE(created_at) as date,
    COUNT(DISTINCT username) as active_users
FROM user_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Most Active Users (Last 7 days)
SELECT 
    username,
    COUNT(*) as total_actions,
    COUNT(DISTINCT DATE(created_at)) as days_active,
    MAX(created_at) as last_active
FROM user_logs
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY username
ORDER BY total_actions DESC
LIMIT 10;

-- ============================================
-- AUTHENTICATION METRICS
-- ============================================

-- Login Success Rate
SELECT 
    username,
    COUNT(*) FILTER (WHERE event_type = 'login_success') as successful_logins,
    COUNT(*) FILTER (WHERE event_type = 'login_failure') as failed_logins,
    ROUND(
        COUNT(*) FILTER (WHERE event_type = 'login_success')::NUMERIC / 
        NULLIF(COUNT(*), 0) * 100, 
        2
    ) as success_rate_percent
FROM user_logs
WHERE event_category = 'auth'
    AND event_type IN ('login_success', 'login_failure')
    AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY username
ORDER BY successful_logins DESC;

-- Login Activity by Hour of Day
SELECT 
    EXTRACT(HOUR FROM created_at) as hour,
    COUNT(*) as login_count
FROM user_logs
WHERE event_type = 'login_success'
    AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY EXTRACT(HOUR FROM created_at)
ORDER BY hour;

-- ============================================
-- REPORT CREATION METRICS
-- ============================================

-- Report Creation Funnel
WITH report_stats AS (
    SELECT 
        report_id,
        MIN(created_at) FILTER (WHERE event_type = 'report_creation_started') as started_at,
        MAX(created_at) FILTER (WHERE event_type = 'report_creation_completed') as completed_at,
        COUNT(*) FILTER (WHERE event_category = 'step') as step_actions
    FROM user_logs
    WHERE created_at >= NOW() - INTERVAL '30 days'
    GROUP BY report_id
)
SELECT 
    COUNT(*) as total_reports_started,
    COUNT(*) FILTER (WHERE completed_at IS NOT NULL) as total_reports_completed,
    ROUND(
        COUNT(*) FILTER (WHERE completed_at IS NOT NULL)::NUMERIC / 
        NULLIF(COUNT(*), 0) * 100, 
        2
    ) as completion_rate_percent,
    ROUND(AVG(EXTRACT(EPOCH FROM (completed_at - started_at)) / 60), 2) as avg_completion_time_minutes
FROM report_stats;

-- Reports by User (Last 30 days)
SELECT 
    username,
    COUNT(DISTINCT report_id) FILTER (WHERE event_type = 'report_creation_started') as reports_started,
    COUNT(DISTINCT report_id) FILTER (WHERE event_type = 'report_creation_completed') as reports_completed
FROM user_logs
WHERE event_category = 'report'
    AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY username
ORDER BY reports_completed DESC;

-- Average Time per Report
WITH report_times AS (
    SELECT 
        username,
        report_id,
        MIN(created_at) FILTER (WHERE event_type = 'report_creation_started') as started_at,
        MAX(created_at) FILTER (WHERE event_type = 'report_creation_completed') as completed_at
    FROM user_logs
    WHERE event_category = 'report'
        AND created_at >= NOW() - INTERVAL '30 days'
    GROUP BY username, report_id
    HAVING MAX(created_at) FILTER (WHERE event_type = 'report_creation_completed') IS NOT NULL
)
SELECT 
    username,
    COUNT(*) as completed_reports,
    ROUND(AVG(EXTRACT(EPOCH FROM (completed_at - started_at)) / 60), 2) as avg_minutes_per_report,
    MIN(EXTRACT(EPOCH FROM (completed_at - started_at)) / 60) as fastest_report_minutes,
    MAX(EXTRACT(EPOCH FROM (completed_at - started_at)) / 60) as slowest_report_minutes
FROM report_times
GROUP BY username
ORDER BY avg_minutes_per_report;

-- ============================================
-- STEP NAVIGATION ANALYSIS
-- ============================================

-- Step Completion Rates
SELECT 
    step_number,
    COUNT(*) FILTER (WHERE event_type = 'step_entered') as times_entered,
    COUNT(*) FILTER (WHERE event_type = 'step_completed') as times_completed,
    COUNT(*) FILTER (WHERE event_type = 'step_skipped') as times_skipped,
    ROUND(
        COUNT(*) FILTER (WHERE event_type = 'step_completed')::NUMERIC / 
        NULLIF(COUNT(*) FILTER (WHERE event_type = 'step_entered'), 0) * 100, 
        2
    ) as completion_rate_percent
FROM user_logs
WHERE event_category = 'step'
    AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY step_number
ORDER BY step_number;

-- Average Time Spent per Step
WITH step_times AS (
    SELECT 
        report_id,
        step_number,
        MIN(created_at) FILTER (WHERE event_type = 'step_entered') as entered_at,
        MAX(created_at) FILTER (WHERE event_type IN ('step_completed', 'step_skipped')) as exited_at
    FROM user_logs
    WHERE event_category = 'step'
        AND created_at >= NOW() - INTERVAL '30 days'
    GROUP BY report_id, step_number
)
SELECT 
    step_number,
    COUNT(*) as step_instances,
    ROUND(AVG(EXTRACT(EPOCH FROM (exited_at - entered_at)) / 60), 2) as avg_minutes_spent
FROM step_times
WHERE exited_at IS NOT NULL
GROUP BY step_number
ORDER BY step_number;

-- Step Drop-off Analysis
WITH step_sequence AS (
    SELECT 
        report_id,
        step_number,
        event_type,
        created_at,
        ROW_NUMBER() OVER (PARTITION BY report_id ORDER BY created_at) as step_order
    FROM user_logs
    WHERE event_category = 'step'
        AND created_at >= NOW() - INTERVAL '30 days'
)
SELECT 
    step_number,
    COUNT(DISTINCT report_id) as reports_reached_this_step,
    COUNT(DISTINCT report_id) FILTER (
        WHERE event_type IN ('step_completed', 'step_verified')
    ) as reports_completed_this_step
FROM step_sequence
GROUP BY step_number
ORDER BY step_number;

-- ============================================
-- IMAGE UPLOAD METRICS
-- ============================================

-- Image Uploads by Section
SELECT 
    section_name,
    step_number,
    COUNT(*) as total_uploads,
    COUNT(DISTINCT username) as unique_users,
    ROUND(AVG((event_details->>'file_size_kb')::NUMERIC), 2) as avg_file_size_kb
FROM user_logs
WHERE event_type = 'image_uploaded'
    AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY section_name, step_number
ORDER BY total_uploads DESC;

-- Image Upload Activity by User
SELECT 
    username,
    COUNT(*) FILTER (WHERE event_type = 'image_uploaded') as images_uploaded,
    COUNT(*) FILTER (WHERE event_type = 'image_deleted') as images_deleted,
    COUNT(DISTINCT report_id) as reports_with_images
FROM user_logs
WHERE event_category = 'image'
    AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY username
ORDER BY images_uploaded DESC;

-- ============================================
-- AUTO-SAVE PERFORMANCE
-- ============================================

-- Auto-save Success Rate
SELECT 
    DATE(created_at) as date,
    COUNT(*) FILTER (WHERE event_type = 'autosave_success') as successful_saves,
    COUNT(*) FILTER (WHERE event_type = 'autosave_failed') as failed_saves,
    ROUND(
        COUNT(*) FILTER (WHERE event_type = 'autosave_success')::NUMERIC / 
        NULLIF(COUNT(*), 0) * 100, 
        2
    ) as success_rate_percent
FROM user_logs
WHERE event_category = 'autosave'
    AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Auto-save Failures by Error
SELECT 
    error_message,
    COUNT(*) as failure_count,
    COUNT(DISTINCT username) as affected_users,
    MAX(created_at) as last_occurrence
FROM user_logs
WHERE event_type = 'autosave_failed'
    AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY error_message
ORDER BY failure_count DESC;

-- ============================================
-- PDF GENERATION METRICS
-- ============================================

-- PDF Generation Success Rate
SELECT 
    username,
    COUNT(*) FILTER (WHERE event_type = 'pdf_generation_started') as generation_attempts,
    COUNT(*) FILTER (WHERE event_type = 'pdf_generation_success') as successful_generations,
    COUNT(*) FILTER (WHERE event_type = 'pdf_generation_failed') as failed_generations,
    ROUND(
        COUNT(*) FILTER (WHERE event_type = 'pdf_generation_success')::NUMERIC / 
        NULLIF(COUNT(*) FILTER (WHERE event_type = 'pdf_generation_started'), 0) * 100, 
        2
    ) as success_rate_percent
FROM user_logs
WHERE event_category = 'pdf'
    AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY username
ORDER BY generation_attempts DESC;

-- Average PDF Generation Time
SELECT 
    username,
    COUNT(*) as pdfs_generated,
    ROUND(AVG((event_details->>'generation_time_ms')::NUMERIC), 2) as avg_generation_time_ms,
    ROUND(AVG((event_details->>'file_size_kb')::NUMERIC), 2) as avg_file_size_kb
FROM user_logs
WHERE event_type = 'pdf_generation_success'
    AND created_at >= NOW() - INTERVAL '30 days'
    AND event_details ? 'generation_time_ms'
GROUP BY username
ORDER BY pdfs_generated DESC;

-- ============================================
-- ERROR TRACKING
-- ============================================

-- Error Frequency by Type
SELECT 
    event_type,
    error_code,
    COUNT(*) as error_count,
    COUNT(DISTINCT username) as affected_users,
    MAX(created_at) as last_occurrence,
    MODE() WITHIN GROUP (ORDER BY error_message) as most_common_message
FROM user_logs
WHERE event_category = 'error'
    AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY event_type, error_code
ORDER BY error_count DESC;

-- Errors by User
SELECT 
    username,
    COUNT(*) FILTER (WHERE event_type = 'frontend_error') as frontend_errors,
    COUNT(*) FILTER (WHERE event_type = 'backend_error') as backend_errors,
    COUNT(*) as total_errors,
    MAX(created_at) as last_error_at
FROM user_logs
WHERE event_category = 'error'
    AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY username
ORDER BY total_errors DESC;

-- Recent Critical Errors (Last 24 hours)
SELECT 
    username,
    event_type,
    error_code,
    error_message,
    report_id,
    step_number,
    created_at
FROM user_logs
WHERE event_category = 'error'
    AND created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC
LIMIT 50;

-- ============================================
-- DATA EXTRACTION METRICS
-- ============================================

-- Extraction Success Rate
SELECT 
    DATE(created_at) as date,
    COUNT(*) FILTER (WHERE event_type = 'extraction_success') as successful_extractions,
    COUNT(*) FILTER (WHERE event_type = 'extraction_failed') as failed_extractions,
    ROUND(
        COUNT(*) FILTER (WHERE event_type = 'extraction_success')::NUMERIC / 
        NULLIF(COUNT(*), 0) * 100, 
        2
    ) as success_rate_percent
FROM user_logs
WHERE event_category = 'extraction'
    AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- ============================================
-- SESSION ANALYSIS
-- ============================================

-- Average Session Duration by User
WITH session_durations AS (
    SELECT 
        username,
        session_id,
        MIN(created_at) as session_start,
        MAX(created_at) as session_end
    FROM user_logs
    WHERE created_at >= NOW() - INTERVAL '30 days'
    GROUP BY username, session_id
)
SELECT 
    username,
    COUNT(*) as total_sessions,
    ROUND(AVG(EXTRACT(EPOCH FROM (session_end - session_start)) / 60), 2) as avg_session_minutes,
    MAX(EXTRACT(EPOCH FROM (session_end - session_start)) / 60) as longest_session_minutes
FROM session_durations
GROUP BY username
ORDER BY avg_session_minutes DESC;

-- Activity by Time of Day
SELECT 
    EXTRACT(HOUR FROM created_at) as hour_of_day,
    COUNT(*) as total_actions,
    COUNT(DISTINCT username) as active_users
FROM user_logs
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY EXTRACT(HOUR FROM created_at)
ORDER BY hour_of_day;

-- ============================================
-- COMPREHENSIVE USER DASHBOARD
-- ============================================

-- Complete User Activity Summary (Last 30 days)
WITH user_activity AS (
    SELECT 
        username,
        COUNT(*) as total_actions,
        COUNT(DISTINCT session_id) as total_sessions,
        COUNT(DISTINCT DATE(created_at)) as days_active,
        COUNT(DISTINCT report_id) as reports_touched,
        
        -- Auth
        COUNT(*) FILTER (WHERE event_type = 'login_success') as logins,
        
        -- Reports
        COUNT(*) FILTER (WHERE event_type = 'report_creation_completed') as reports_completed,
        
        -- Steps
        COUNT(*) FILTER (WHERE event_type = 'step_completed') as steps_completed,
        
        -- Images
        COUNT(*) FILTER (WHERE event_type = 'image_uploaded') as images_uploaded,
        
        -- PDFs
        COUNT(*) FILTER (WHERE event_type = 'pdf_generation_success') as pdfs_generated,
        
        -- Errors
        COUNT(*) FILTER (WHERE event_category = 'error') as errors_encountered,
        
        -- Timestamps
        MIN(created_at) as first_activity,
        MAX(created_at) as last_activity
    FROM user_logs
    WHERE created_at >= NOW() - INTERVAL '30 days'
    GROUP BY username
)
SELECT 
    username,
    total_actions,
    total_sessions,
    days_active,
    logins,
    reports_touched,
    reports_completed,
    steps_completed,
    images_uploaded, 
    pdfs_generated,
    errors_encountered,
    ROUND(total_actions::NUMERIC / NULLIF(days_active, 0), 2) as avg_actions_per_day,
    last_activity
FROM user_activity
ORDER BY total_actions DESC;
