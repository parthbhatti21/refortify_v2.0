# 📊 User Activity Logging System - Quick Start

A comprehensive logging system for tracking all user activities in the Reportify application using a separate Supabase database.

## 🚀 Quick Start (3 Steps)

### Step 1: Set Up Database
1. Create a NEW Supabase project (separate from your main database)
2. Open SQL Editor in Supabase dashboard
3. Run the SQL script: `create_user_logs_table.sql`

### Step 2: Configure Environment
Add to `.env.local`:
```env
REACT_APP_LOGGING_SUPABASE_URL=https://your-logging-project.supabase.co
REACT_APP_LOGGING_SUPABASE_ANON_KEY=your-logging-anon-key
```

### Step 3: Start Logging
```typescript
import { logger } from './lib/loggingService';

// Log user login
await logger.logLoginSuccess('john_doe');

// Log step navigation
await logger.logStepEntered('john_doe', 'report_123', 5);

// Log image upload
await logger.logImageUploaded('john_doe', 'report_123', 6, 'chimney_exterior');
```

## 📁 Files Created

| File | Description |
|------|-------------|
| `create_user_logs_table.sql` | Database schema and setup |
| `src/lib/loggingClient.ts` | Supabase client for logging database |
| `src/lib/loggingService.ts` | Main logging service with all methods |
| `src/lib/loggingIntegrationExamples.ts` | Integration examples for your components |
| `LOGGING_SETUP_GUIDE.md` | Comprehensive documentation |
| `LOGGING_QUICK_START.md` | This file |

## 📋 What Gets Logged

✅ **Authentication**: Login success/failure, logout  
✅ **Data Extraction**: Start, success, failure with error messages  
✅ **Report Creation**: Started, in-progress, completed  
✅ **Step Navigation**: Entered, verified, skipped, completed (Steps 1-10)  
✅ **Image Operations**: Uploads and deletions with section info  
✅ **Auto-save**: Triggered, success, failure  
✅ **PDF Generation**: Started, success, upload, failures  
✅ **Errors**: Frontend and backend errors with stack traces  

## 🎯 Common Use Cases

### Track User Login
```typescript
await logger.logLoginSuccess('john_doe', {
  login_method: 'password',
  device: 'desktop'
});
```

### Track Report Progress
```typescript
// Start report
await logger.logReportCreationStarted('john_doe', 'report_123');

// Navigate steps
await logger.logStepEntered('john_doe', 'report_123', 1);
await logger.logStepCompleted('john_doe', 'report_123', 1);

// Complete report
await logger.logReportCreationCompleted('john_doe', 'report_123');
```

### Track Image Uploads
```typescript
await logger.logImageUploaded('john_doe', 'report_123', 6, 'chimney_exterior', {
  file_name: 'front_view.jpg',
  file_size_kb: 2048
});
```

### Track Errors
```typescript
try {
  // Your code
} catch (error) {
  await logger.logFrontendError('john_doe', 'ERROR_CODE', error.message, error.stack);
}
```

## 📊 Query Your Logs

### Recent Activity
```sql
SELECT * FROM recent_user_activity;
```

### User Statistics
```sql
SELECT * FROM get_user_stats('john_doe', 30);
```

### All Errors
```sql
SELECT * FROM user_logs 
WHERE event_category = 'error' 
ORDER BY created_at DESC;
```

## 🔍 Available Methods

**Authentication:**
- `logLoginSuccess(username, details?)`
- `logLoginFailure(username, errorMessage, details?)`
- `logLogout(username, details?)`

**Data Extraction:**
- `logExtractionStarted(username, reportId, details?)`
- `logExtractionSuccess(username, reportId, details?)`
- `logExtractionFailed(username, reportId, errorMessage, details?)`

**Report Creation:**
- `logReportCreationStarted(username, reportId, details?)`
- `logReportCreationInProgress(username, reportId, details?)`
- `logReportCreationCompleted(username, reportId, details?)`

**Step Navigation:**
- `logStepEntered(username, reportId, stepNumber, details?)`
- `logStepVerified(username, reportId, stepNumber, details?)`
- `logStepSkipped(username, reportId, stepNumber, details?)`
- `logStepCompleted(username, reportId, stepNumber, details?)`

**Image Operations:**
- `logImageUploaded(username, reportId, stepNumber, sectionName, details?)`
- `logImageDeleted(username, reportId, stepNumber, sectionName, details?)`

**Auto-save:**
- `logAutosaveTriggered(username, reportId, details?)`
- `logAutosaveSuccess(username, reportId, details?)`
- `logAutosaveFailed(username, reportId, errorMessage, details?)`

**PDF Operations:**
- `logPdfGenerationStarted(username, reportId, details?)`
- `logPdfGenerationSuccess(username, reportId, details?)`
- `logPdfUploadSuccess(username, reportId, details?)`
- `logPdfGenerationFailed(username, reportId, errorMessage, details?)`

**Error Tracking:**
- `logFrontendError(username, errorCode, errorMessage, stackTrace?, details?)`
- `logBackendError(username, errorCode, errorMessage, stackTrace?, details?)`

## 🛠️ Session Management

```typescript
// Reset session on login
logger.resetSession();

// Get current session ID
const sessionId = logger.getCurrentSessionId();
```

## 📚 Documentation

- **Full Documentation**: See `LOGGING_SETUP_GUIDE.md`
- **Integration Examples**: See `src/lib/loggingIntegrationExamples.ts`
- **Database Schema**: See `create_user_logs_table.sql`

## 🔒 Security

- Row Level Security (RLS) enabled
- Users can only see their own logs
- Service role has admin access
- No sensitive data logged by default

## 💡 Tips

1. Always log errors with proper context
2. Include `event_details` for additional metadata
3. Use meaningful report IDs
4. Track session IDs for debugging
5. Review logs regularly for insights

## 🎉 Benefits

- ✨ Complete audit trail of user actions
- 🐛 Better debugging with error tracking
- 📈 Usage analytics and insights
- 🔍 Performance monitoring
- 👥 User behavior understanding

## 📞 Need Help?

1. Check `LOGGING_SETUP_GUIDE.md` for detailed docs
2. Review `loggingIntegrationExamples.ts` for code examples
3. Verify environment variables are set
4. Test with a simple login event first

---

**Ready to start?** Run the SQL script, add your env vars, and start logging! 🚀
