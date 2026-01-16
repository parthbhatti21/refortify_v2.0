# 📋 User Activity Logging - Deployment Checklist

Use this checklist to deploy the logging system step by step.

---

## ✅ Phase 1: Database Setup

### Task 1.1: Create New Supabase Project
- [ ] Go to https://supabase.com
- [ ] Click "New Project"
- [ ] Project name: `reportify-logs` (or your choice)
- [ ] Database password: (save securely)
- [ ] Region: (choose closest to users)
- [ ] Click "Create new project"
- [ ] Wait for project to finish setting up (~2 minutes)

### Task 1.2: Get Credentials
- [ ] In Supabase dashboard, go to Settings → API
- [ ] Copy **Project URL** (looks like: `https://xxxxx.supabase.co`)
- [ ] Copy **anon/public key** (long string starting with `eyJ...`)
- [ ] Save both in a secure note temporarily

### Task 1.3: Run Database Migration
- [ ] In Supabase dashboard, click "SQL Editor" in left sidebar
- [ ] Click "New query"
- [ ] Open file: `create_user_logs_table.sql` in your project
- [ ] Copy the entire contents
- [ ] Paste into SQL Editor
- [ ] Click "Run" (or press Cmd/Ctrl + Enter)
- [ ] Verify: "Success. No rows returned" message appears
- [ ] Go to "Table Editor" → should see `user_logs` table

### Task 1.4: Verify Database Setup
- [ ] In Table Editor, click on `user_logs` table
- [ ] Verify all columns are present

---

## ✅ Phase 2: Application Configuration

### Task 2.1: Update Environment Variables
- [ ] Open `.env.local` in your project root
- [ ] Replace `YOUR_LOGGING_SUPABASE_URL_HERE` with your Project URL
- [ ] Replace `YOUR_LOGGING_SUPABASE_ANON_KEY_HERE` with your anon key
- [ ] Save the file

---

## ✅ Phase 3: Integration

### Task 3.1: Integrate Login Events
- [ ] Import logger in Login component
- [ ] Add login success logging
- [ ] Add login failure logging
- [ ] Test and verify

### Task 3.2: Integrate Step Navigation
- [ ] Add step entered logging
- [ ] Add step completed logging
- [ ] Test and verify

### Task 3.3: Integrate Image Upload
- [ ] Add image upload logging
- [ ] Test and verify

### Task 3.4: Integrate Error Tracking
- [ ] Add global error handler
- [ ] Add error boundaries
- [ ] Test and verify

---

## ✅ Phase 4: Testing & Deployment

### Task 4.1: Test All Events
- [ ] Test login/logout
- [ ] Test step navigation
- [ ] Test image uploads
- [ ] Test error logging

### Task 4.2: Deploy to Production
- [ ] Commit changes
- [ ] Deploy application
- [ ] Verify logs appear in Supabase

---

## 🎉 Completion

- [ ] All integrations complete
- [ ] Testing successful
- [ ] Production deployed
- [ ] Team trained

**Status**: □ Not Started  /  □ In Progress  /  □ Complete
