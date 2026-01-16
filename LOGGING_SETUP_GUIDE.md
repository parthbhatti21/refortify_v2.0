# User Activity Logging Setup Guide

This guide explains how to set up and use the comprehensive user activity logging system for Reportify.

## 📋 Table of Contents

1. [Database Setup](#database-setup)
2. [Environment Configuration](#environment-configuration)
3. [Usage Examples](#usage-examples)
4. [Event Types Reference](#event-types-reference)
5. [Query Examples](#query-examples)

---

## 🗄️ Database Setup

### Step 1: Create New Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project for logging (separate from your main database)
3. Note down the project URL and anon key

### Step 2: Run Migration SQL

1. Open your new Supabase project dashboard
2. Go to **SQL Editor**
3. Copy the contents of `create_user_logs_table.sql`
4. Paste and execute the SQL script

This will create:
- `user_logs` table with all necessary columns
- Indexes for optimal query performance
- Row Level Security policies
- Helper functions for statistics and cleanup

---

## ⚙️ Environment Configuration

Add these environment variables to your `.env.local` file:

```env
# Logging Database (NEW Supabase Project)
REACT_APP_LOGGING_SUPABASE_URL=https://your-logging-project.supabase.co
REACT_APP_LOGGING_SUPABASE_ANON_KEY=your-logging-anon-key
```

---

## 💻 Usage Examples

### Import the Logger

```typescript
import { logger } from './lib/loggingService';
```

### 1. Authentication Events

```typescript
// Login success
await logger.logLoginSuccess('john_doe', {
  login_method: 'password',
  device: 'desktop'
});

// Login failure
await logger.logLoginFailure('john_doe', 'Invalid credentials', {
  attempted_username: 'john_doe',
  ip: '192.168.1.1'
});

// Logout
await logger.logLogout('john_doe');
```

### 2. Data Extraction Events

```typescript
// Extraction started
await logger.logExtractionStarted('john_doe', 'report_12345', {
  source: 'google_sheets',
  row_count: 150
});

// Extraction success
await logger.logExtractionSuccess('john_doe', 'report_12345', {
  records_extracted: 150,
  duration_ms: 2500
});

// Extraction failed
await logger.logExtractionFailed('john_doe', 'report_12345', 
  'Connection timeout', {
    retry_count: 3,
    last_error: 'TIMEOUT'
  }
);
```

### 3. Report Creation Flow

```typescript
// Report creation started
await logger.logReportCreationStarted('john_doe', 'report_12345', {
  template: 'standard',
  customer_name: 'Acme Corp'
});

// Report in progress
await logger.logReportCreationInProgress('john_doe', 'report_12345', {
  current_step: 5,
  completion_percentage: 50
});

// Report completed
await logger.logReportCreationCompleted('john_doe', 'report_12345', {
  total_time_seconds: 1200,
  steps_completed: 10
});
```

### 4. Step Navigation Tracking

```typescript
// Step entered
await logger.logStepEntered('john_doe', 'report_12345', 3, {
  previous_step: 2
});

// Step verified
await logger.logStepVerified('john_doe', 'report_12345', 3, {
  validation_passed: true
});

// Step skipped
await logger.logStepSkipped('john_doe', 'report_12345', 4, {
  reason: 'not_applicable'
});

// Step completed
await logger.logStepCompleted('john_doe', 'report_12345', 5, {
  time_spent_seconds: 120
});
```

### 5. Image Upload Events

```typescript
// Image uploaded
await logger.logImageUploaded('john_doe', 'report_12345', 6, 
  'chimney_exterior', {
    file_name: 'chimney_front.jpg',
    file_size_kb: 2048,
    image_count: 3
  }
);

// Image deleted
await logger.logImageDeleted('john_doe', 'report_12345', 6, 
  'chimney_exterior', {
    file_name: 'chimney_front.jpg',
    reason: 'duplicate'
  }
);
```

### 6. Auto-save Tracking

```typescript
// Auto-save triggered
await logger.logAutosaveTriggered('john_doe', 'report_12345', {
  trigger: 'timer',
  interval_seconds: 30
});

// Auto-save success
await logger.logAutosaveSuccess('john_doe', 'report_12345', {
  fields_saved: 15,
  save_duration_ms: 150
});

// Auto-save failed
await logger.logAutosaveFailed('john_doe', 'report_12345', 
  'Network error', {
    retry_scheduled: true
  }
);
```

### 7. PDF Generation Events

```typescript
// PDF generation started
await logger.logPdfGenerationStarted('john_doe', 'report_12345', {
  page_count: 25
});

// PDF generation success
await logger.logPdfGenerationSuccess('john_doe', 'report_12345', {
  file_size_kb: 5120,
  generation_time_ms: 3500
});

// PDF upload success
await logger.logPdfUploadSuccess('john_doe', 'report_12345', {
  storage_path: 'reports/2026/report_12345.pdf'
});

// PDF generation failed
await logger.logPdfGenerationFailed('john_doe', 'report_12345', 
  'Rendering error on page 12', {
    error_page: 12
  }
);
```

### 8. Error Tracking

```typescript
// Frontend error
try {
  // Some operation
} catch (error) {
  await logger.logFrontendError(
    'john_doe',
    'FORM_VALIDATION_ERROR',
    error.message,
    error.stack,
    {
      component: 'MultiStepForm',
      step: 5
    }
  );
}

// Backend error
await logger.logBackendError(
  'john_doe',
  'API_ERROR_500',
  'Failed to save report',
  'Stack trace here...',
  {
    endpoint: '/api/reports/save',
    status_code: 500
  }
);
```

### Session Management

```typescript
// Reset session on login
logger.resetSession();

// Get current session ID
const sessionId = logger.getCurrentSessionId();
```

---

## 📊 Event Types Reference

### Event Categories

| Category | Description |
|----------|-------------|
| `auth` | Authentication and authorization events |
| `extraction` | Data extraction lifecycle |
| `report` | Report creation and management |
| `step` | Step navigation tracking |
| `image` | Image upload and deletion |
| `autosave` | Auto-save operations |
| `pdf` | PDF generation and upload |
| `error` | Error tracking |

### Event Types by Category

#### Auth Events
- `login_success`
- `login_failure`
- `logout`

#### Extraction Events
- `extraction_started`
- `extraction_success`
- `extraction_failed`

#### Report Events
- `report_creation_started`
- `report_creation_in_progress`
- `report_creation_completed`

#### Step Events
- `step_entered`
- `step_verified`
- `step_skipped`
- `step_completed`

#### Image Events
- `image_uploaded`
- `image_deleted`

#### Autosave Events
- `autosave_triggered`
- `autosave_success`
- `autosave_failed`

#### PDF Events
- `pdf_generation_started`
- `pdf_generation_success`
- `pdf_upload_success`
- `pdf_generation_failed`

#### Error Events
- `frontend_error`
- `backend_error`

---

## 🔍 Query Examples

### View Recent Activity

```sql
SELECT * FROM recent_user_activity;
```

### Get User Statistics

```sql
-- Last 30 days
SELECT * FROM get_user_stats('john_doe', 30);

-- Last 7 days
SELECT * FROM get_user_stats('john_doe', 7);
```

### Find All Login Failures

```sql
SELECT username, error_message, created_at
FROM user_logs
WHERE event_type = 'login_failure'
ORDER BY created_at DESC;
```

### Track Report Progress

```sql
SELECT event_type, step_number, created_at
FROM user_logs
WHERE report_id = 'report_12345'
  AND event_category = 'step'
ORDER BY created_at ASC;
```

### Find All Errors for a User

```sql
SELECT event_type, error_code, error_message, created_at
FROM user_logs
WHERE username = 'john_doe'
  AND event_category = 'error'
ORDER BY created_at DESC;
```

### Get Image Upload Activity

```sql
SELECT section_name, step_number, event_details, created_at
FROM user_logs
WHERE username = 'john_doe'
  AND event_type = 'image_uploaded'
ORDER BY created_at DESC;
```

### Daily Activity Summary

```sql
SELECT 
  DATE(created_at) as date,
  event_category,
  COUNT(*) as event_count
FROM user_logs
WHERE username = 'john_doe'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at), event_category
ORDER BY date DESC, event_count DESC;
```

### Most Active Users

```sql
SELECT 
  username,
  COUNT(*) as total_actions,
  COUNT(DISTINCT report_id) as reports_worked_on,
  MAX(created_at) as last_active
FROM user_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY username
ORDER BY total_actions DESC;
```

### PDF Generation Success Rate

```sql
SELECT 
  username,
  COUNT(*) FILTER (WHERE event_type = 'pdf_generation_success') as successful,
  COUNT(*) FILTER (WHERE event_type = 'pdf_generation_failed') as failed,
  ROUND(
    COUNT(*) FILTER (WHERE event_type = 'pdf_generation_success')::NUMERIC / 
    NULLIF(COUNT(*), 0) * 100, 
    2
  ) as success_rate_percent
FROM user_logs
WHERE event_category = 'pdf'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY username;
```

---

## 🧹 Maintenance

### Clean Up Old Logs

```sql
-- Delete logs older than 90 days
SELECT cleanup_old_logs();
```

### Monitor Database Size

```sql
SELECT 
  pg_size_pretty(pg_total_relation_size('user_logs')) as total_size,
  COUNT(*) as total_records
FROM user_logs;
```

---

## 🔒 Security Notes

1. **Row Level Security (RLS)** is enabled on the `user_logs` table
2. Users can only insert and read their own logs
3. Service role has full access for admin operations
4. Never log sensitive information like passwords or API keys
5. Stack traces are optional and should be sanitized if needed

---

## 📱 Integration Tips

### React Component Example

```typescript
import { useEffect } from 'react';
import { logger } from './lib/loggingService';

function MultiStepForm({ username, reportId }) {
  useEffect(() => {
    // Log when component mounts
    logger.logReportCreationInProgress(username, reportId, {
      component: 'MultiStepForm'
    });
  }, [username, reportId]);

  const handleStepChange = async (stepNumber: number) => {
    await logger.logStepEntered(username, reportId, stepNumber);
  };

  return (
    // Your component JSX
  );
}
```

### Error Boundary Integration

```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    logger.logFrontendError(
      this.props.username,
      'REACT_ERROR_BOUNDARY',
      error.message,
      error.stack,
      { componentStack: errorInfo.componentStack }
    );
  }
}
```

---

## 📈 Dashboard Ideas

You can build dashboards to visualize:
- User activity heatmaps
- Report creation funnels
- Error rates and types
- PDF generation metrics
- Step completion rates
- Image upload patterns
- Auto-save performance

---

## 🆘 Support

For issues or questions:
1. Check the SQL schema in `create_user_logs_table.sql`
2. Review the TypeScript service in `src/lib/loggingService.ts`
3. Verify environment variables are set correctly
4. Check Supabase dashboard for RLS policies

---

## 🎯 Next Steps

1. ✅ Run the SQL migration in your new Supabase project
2. ✅ Add environment variables to `.env.local`
3. ✅ Import and use the logger in your components
4. ✅ Test with a few events
5. ✅ Query the logs to verify everything works
6. ✅ Build analytics dashboards as needed
