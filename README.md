# SumoQuote v2 - Chimney Service Quote Generator

A comprehensive React-based application for generating professional chimney service quotes and reports. This application streamlines the process of creating detailed service reports, repair estimates, and documentation for chimney service companies.

## Features

### Multi-Step Quote Generation
- **Step 1**: Manual Entry - Client information and service details
- **Step 2**: Static Content - Company credentials and insurance information
- **Step 3**: Service Report - Detailed service information and timeline
- **Step 4**: Chimney Type - Masonry or prefabricated chimney selection
- **Step 5**: Invoice Management - Dynamic invoice generation with multiple pages
- **Step 6**: Project Images - Image selection and management (max 4 images) + **Device Upload** 📤
- **Step 7**: Repair Estimate - Comprehensive repair cost estimation
- **Step 8**: Inspection Images - Additional inspection image display
- **Step 9**: Documentation - Chimney-specific documentation (3-4 parts based on chimney type)
- **Step 10**: Final Steps - Final report generation and review

### Key Capabilities
- **Data Scraping**: Automated data extraction from various sources
- **Image Management**: Upload, crop, and organize service images
- **Device Image Upload**: Upload images directly from your device in Step 6 ✨ NEW
- **Auto-Save**: Automatic form data saving on every page navigation 💾 NEW
- **Draft Management**: Save and resume incomplete reports 📝 NEW
- **PDF Status Tracking**: Track which reports have PDFs uploaded 📊 NEW
- **PDF Generation**: Professional PDF report generation with proper formatting
- **Report Library**: View, edit, preview, and download all reports with smart filtering
- **Responsive Design**: Mobile-friendly interface with adaptive layouts
- **Real-time Preview**: Live preview of all steps before PDF generation
- **Multi-page Support**: Dynamic page generation for invoices and documentation
- **Supabase Integration**: Cloud database for report and client data storage

## Technology Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Supabase** for database and authentication
- **html2canvas** for PDF generation
- **jsPDF** for PDF creation
- **React Router** for navigation
- **AWS S3** for PDF file storage
- **Custom Components** for specialized functionality

## Project Structure

```
src/
├── components/
│   ├── Step1.tsx              # Manual Entry
│   ├── Step2.tsx              # Static Content
│   ├── Step3.tsx              # Service Report
│   ├── Step3.css              # Service Report styles
│   ├── Step4.tsx              # Chimney Type
│   ├── Step4.module.css       # Chimney Type styles
│   ├── Step5.tsx              # Invoice Management
│   ├── Step5.module.css       # Invoice styles
│   ├── Step6.tsx              # Project Images (with device upload)
│   ├── Step6.module.css       # Image selection styles
│   ├── Step7.tsx              # Repair Estimate
│   ├── Step7.module.css       # Repair estimate styles
│   ├── Step8.tsx              # Inspection Images
│   ├── Step9-part1.tsx        # Documentation Part 1
│   ├── Step9-part2.tsx        # Documentation Part 2
│   ├── Step9-part3.tsx        # Documentation Part 3
│   ├── Step9-part4.tsx        # Documentation Part 4 (Prefabricated only)
│   ├── Step10Part1.tsx        # Final Steps Part 1
│   ├── Step10Part2.tsx        # Final Steps Part 2
│   ├── MultiStepForm.tsx      # Main application logic
│   ├── DataScraper.tsx        # Data extraction component
│   ├── ImageCropper.tsx       # Image editing component
│   ├── Library.tsx            # Report library and management
│   └── FormInputs.tsx         # Reusable form components
├── lib/
│   └── supabaseClient.ts      # Supabase configuration
├── App.tsx                    # Main application component
├── App.css                    # Global styles
├── index.tsx                  # Application entry point
└── index.css                  # Base styles
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sumoquote-v2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   # Supabase Configuration
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # AWS S3 Configuration (for PDF storage)
   REACT_APP_API_BASE=your_backend_api_url
   REACT_APP_API_KEY=your_backend_api_key
   
   # Optional: Google Sheets Integration
   REACT_APP_GOOGLE_SHEETS_API_KEY=your_google_sheets_api_key
   REACT_APP_GOOGLE_SHEET_ID=your_google_sheet_id
   REACT_APP_GOOGLE_SHEET_RANGE=Sheet1!A:C
   
   # Optional: PDF Settings
   REACT_APP_PDF_QUALITY=0.78
   ```

4. **Run Database Migrations**
   Execute the SQL migration in Supabase SQL Editor:
   ```bash
   # Run the contents of add_pdf_upload_status.sql
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

### `npm start`
Runs the app in development mode with hot reloading.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder with optimized performance.

### `npm run eject`
**Note: This is a one-way operation!**
Ejects from Create React App to get full control over build configuration.

## Usage

### Basic Workflow

1. **Data Extraction**: Start by scraping client data or manually entering information
2. **Report Creation**: Report is automatically created in database after data extraction ✨ NEW
3. **Step Navigation**: Use the step-by-step interface to complete all required information
4. **Auto-Save**: Form data automatically saves when navigating between pages 💾 NEW
5. **Image Management**: Upload from scraped data OR upload directly from device (maximum 4 total)
6. **Invoice Creation**: Generate detailed invoices with line items and pricing
7. **Repair Estimates**: Create comprehensive repair cost estimates
8. **Documentation**: Review chimney-specific documentation based on chimney type
9. **PDF Generation**: Generate professional PDF reports for client delivery
10. **Report Library**: Access all reports, with draft and complete status indicators

### New Features in v1.4

#### 🖼️ Device Image Upload (Step 6)
- Click "Upload from device" button to select images from your computer
- Supports JPEG, PNG, WebP formats
- Max 4 images total (scraped + uploaded combined)
- Full crop, drag, and resize functionality
- Remove unwanted images with one click
- Images stored as base64 in database

#### 💾 Auto-Save Functionality
- **Automatic saving** on every page navigation
- Works for Steps 1, 3, 5, 6, 7, 8
- Console logs show save progress: "Auto-saving Step X data..." and "✓ Step X data saved"
- Non-blocking - navigation continues even if save is in progress
- Requires user authentication
- Only works after report is created (post-data scraping)

#### 📝 Draft Management
- Reports created immediately after data scraping
- Continue working on incomplete reports
- All draft reports saved with timestamps
- View all drafts in Library with "Draft" badge
- Each draft editable individually

#### 📊 PDF Status Tracking
- Library shows visual badges:
  - **Green "✓ PDF"**: Report has uploaded PDF
  - **Gray "Draft"**: Report is incomplete (no PDF)
- Smart button display:
  - **Drafts**: Show "Edit & Complete" button only
  - **Complete Reports**: Show Edit, Preview, and Download buttons
- Multiple drafts per date supported
- Each draft shows creation time (e.g., "Created at 3:30 PM")

#### 📚 Enhanced Library
- Filter reports by client and date
- View all draft reports for a selected date
- Individual editing of each draft
- Preview and download complete reports
- Responsive design with sort controls

### PDF Generation Features

- **Multi-page Support**: Automatic page generation based on content
- **Responsive Layout**: Proper scaling for different screen sizes
- **Image Optimization**: Compressed images for optimal file size
- **Professional Formatting**: Consistent styling and layout across all pages
- **Chimney Type Support**: Different documentation for masonry vs prefabricated chimneys
- **Cloud Storage**: PDFs uploaded to AWS S3 with tracking in database

### Image Management

- **Scraped Images**: Automatically extracted from data scraping
- **Device Upload**: Click to upload from your computer ✨ NEW
- **Crop Functionality**: Built-in image cropping tool
- **Format Support**: JPEG, PNG, and WebP formats
- **Size Optimization**: Automatic compression for PDF generation
- **Preview Mode**: Real-time preview of selected images
- **Remove Feature**: One-click removal of unwanted images

## Configuration

### Environment Variables
Create a `.env` file in the root directory for environment-specific configurations:

```env
# Supabase Configuration (Required)
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# AWS S3 Backend API (Required for PDF upload/download)
REACT_APP_API_BASE=https://your-backend-url.com
REACT_APP_API_KEY=your_backend_api_key

# Google Sheets Integration (Optional)
REACT_APP_GOOGLE_SHEETS_API_KEY=your_google_sheets_api_key
REACT_APP_GOOGLE_SHEET_ID=your_google_sheet_id
REACT_APP_GOOGLE_SHEET_RANGE=Sheet1!A:C

# PDF Generation Settings (Optional)
REACT_APP_PDF_QUALITY=0.78
```

### Database Setup

#### Required Tables
The application uses the following Supabase tables:

1. **clients** - Client information
2. **reports** - Main report table with PDF tracking
3. **step1_json** - Step 1 form data
4. **step3_json** - Step 3 form data
5. **step5_invoice_json** - Invoice data
6. **step5_part2_json** - Additional invoice data
7. **step6_json** - Image data (base64)
8. **step7_json** - Repair estimate data
9. **step8_json** - Inspection image data

#### SQL Migration
Run this SQL in Supabase SQL Editor to add PDF tracking:

```sql
-- Add PDF upload status tracking columns
ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS pdf_uploaded BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS pdf_url TEXT,
  ADD COLUMN IF NOT EXISTS pdf_uploaded_at TIMESTAMPTZ;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_client_date 
  ON reports(client_id, created_at);
  
CREATE INDEX IF NOT EXISTS idx_reports_pdf_status 
  ON reports(pdf_uploaded);
```

### Customization
- **Styling**: Modify Tailwind CSS classes or add custom CSS
- **Components**: Extend or modify existing components in the `src/components` directory
- **PDF Settings**: Adjust PDF generation parameters in `MultiStepForm.tsx`

## Recent Updates

### v1.4.0 - Draft Management & Auto-Save (January 2026) ✨ LATEST

#### Major Features Added:
1. **Device Image Upload** 📤
   - Upload images directly from device in Step 6
   - Full crop, drag, resize functionality
   - Remove button for each image
   - Max 4 images total (scraped + uploaded)

2. **Auto-Save Functionality** 💾
   - Automatic saving on page navigation
   - Works for Steps 1, 3, 5, 6, 7, 8
   - Console logging for debugging
   - Non-blocking async operations

3. **Early Report Creation** 📝
   - Reports created immediately after data scraping
   - Enables draft management
   - Better state tracking with currentReportId

4. **PDF Status Tracking** 📊
   - Visual badges: "✓ PDF" (complete) or "Draft" (incomplete)
   - Smart button display based on status
   - Database columns: pdf_uploaded, pdf_url, pdf_uploaded_at

5. **Multiple Drafts Support** 🗂️
   - Display all draft reports for selected date
   - Individual editing of each draft
   - Creation timestamps for each draft
   - Numbered draft cards: "Draft Report #1", "#2", etc.

#### Bug Fixes:
- Fixed date parsing error for draft reports
- Fixed "Invalid time value" error in Library
- Added support for both YYYY-MM-DD and M/D/YYYY date formats
- Added safe date rendering with error handling

#### Technical Improvements:
- Enhanced Library.tsx with draft fetching
- Improved handleEditReport to accept specific report IDs
- Added comprehensive error handling
- Enhanced debug logging
