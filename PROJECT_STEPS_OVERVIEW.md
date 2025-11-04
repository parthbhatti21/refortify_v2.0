# SumoQuote v2 - Complete Project Steps Overview

## 📋 Table of Contents
1. [Authentication Flow](#authentication-flow)
2. [Data Collection Phase](#data-collection-phase)
3. [Multi-Step Form Process](#multi-step-form-process)
4. [PDF Generation & Upload](#pdf-generation--upload)
5. [Library Feature](#library-feature)

---

## 🔐 Authentication Flow

### Entry Point: `App.tsx`
- Checks Supabase session on app load
- Shows loading state while checking authentication
- Routes to `Login` component if not authenticated
- Routes to `MultiStepForm` or `Library` if authenticated

### Login Process: `Login.tsx`
**Two-Step Authentication:**

1. **Phase 1: Password Entry**
   - User enters email and password
   - Validates credentials via `supabase.auth.signInWithPassword()`
   - On success: Immediately signs out and proceeds to OTP phase
   - Sets `localStorage.otp_pending = '1'` to maintain OTP phase state

2. **Phase 2: OTP Verification**
   - After password validation, OTP input appears
   - Sends 6-digit code via email using `supabase.auth.signInWithOtp()`
   - User enters OTP code
   - Verifies via `supabase.auth.verifyOtp()`
   - On success: Clears `otp_pending` flag and grants access

**Features:**
- 60-second cooldown timer for "Resend Code" button
- Custom error messages (e.g., "OTP has expired" instead of technical errors)
- Separate loading states for send/verify/resend actions
- Logo integration for better UI

---

## 🔍 Data Collection Phase

### Option 1: Data Scraping (`DataScraper.tsx`)

**Location:** Initial screen before form steps

**Process:**
1. User enters a CompanyCam timeline URL (default: `https://app.companycam.com/timeline/...`)
2. Component scrapes HTML content from the URL
3. Extracts:
   - **Client Name**: From HTML content
   - **Client Address**: From HTML content
   - **Chimney Type**: From HTML content
   - **Report Date**: Current date or extracted date
   - **Timeline Cover Image**: First image found
   - **All Images**: All images from the page as `ImageItem[]`

4. **Review & Edit:**
   - Shows extracted data in editable form
   - User can modify any field before proceeding
   - User can select which images to use as timeline cover
   - Option to load images from previous jobs (date selector)

5. **Manual Entry Option:**
   - Button to skip scraping and enter data manually

**Data Passed to Form:**
```typescript
{
  clientName: string;
  clientAddress: string;
  chimneyType: string;
  reportDate: string;
  timelineCoverImage: string;
  scrapedImages: ImageItem[];
}
```

### Option 2: Manual Entry
- User clicks "Enter Manually" button
- Form starts with empty fields
- User fills in all required information manually

**Library Button:**
- Located on DataScraper page
- Navigates to `/library` route
- Opens file manager to browse uploaded reports

---

## 📝 Multi-Step Form Process

### Navigation System
- **Current Page State**: `currentPage` (number) - tracks physical PDF page number
- **Logical Steps**: 1-10 (each step can span multiple PDF pages)
- **Page-to-Step Mapping**: Calculated dynamically based on content

### Step 1: Client Information (`Step1.tsx`)
**Page Number:** 1  
**Purpose:** Manual entry/edit of client details

**Fields:**
- Client Name (text input)
- Client Address (textarea)
- Chimney Type (dropdown: Masonry / Prefabricated)
- Report Date (date picker)
- Timeline Cover Image (if not from scraping):
  - URL input or crop functionality
  - Image cropper available for editing

**Features:**
- Form validation
- Image upload/crop support
- Pre-fills data from DataScraper if available

---

### Step 2: Static Content (`Step2.tsx`)
**Page Number:** 2  
**Purpose:** Displays company credentials and insurance information

**Content:** (Non-editable static page)
- Company licensing information
- Insurance details
- Professional credentials
- Company branding

**Note:** This is a display-only page in the form workflow.

---

### Step 3: Service Report (`Step3.tsx`)
**Page Number:** 3  
**Purpose:** Service timeline and detailed service information

**Content:**
- Personalized greeting with client name
- Service date and timeline
- Service description
- Timeline cover image display
- Email-style formatted content

**Features:**
- Dynamic client name insertion
- Image rendering from scraped data
- Professional email-style layout

---

### Step 4: Chimney Type Display (`Step4.tsx`)
**Page Number:** 4  
**Purpose:** Visual representation of chimney type

**Content:**
- Displays masonry or prefabricated chimney illustration
- Type-specific imagery
- Visual confirmation of chimney type selected

**Conditional Rendering:**
- Different images based on `formData.chimneyType`
- Masonry vs. Prefabricated visuals

---

### Step 5: Invoice & Repair Estimate (`Step5.tsx`, `Step5-part2.tsx`)
**Page Numbers:** 5 to (4 + invoicePages + repairEstimatePages)  
**Purpose:** Financial documentation

#### Part A: Invoice Pages (`Step5.tsx`)
**Multiple pages based on number of invoice items**

**Features:**
- **Invoice Number** (text input)
- **Payment Method** (text input)
- **Payment Number** (text input)
- **Dynamic Table Rows:**
  - Description
  - Unit
  - Price
  - Add/Remove rows functionality
- **Smart Pagination:** 5 rows per page (prevents row cutoff)

**Calculation:**
```typescript
totalInvoicePages = Math.ceil(invoiceRows.length / 5)
```

#### Part B: Repair Estimate Summary (`Step5-part2.tsx`)
**Multiple pages based on content**

**Features:**
- **Estimate Number** (text input)
- **Payment Method** (text input)
- **Payment Number** (text input)
- **Section 1 (Required):**
  - Title (default: "Repair Estimate#1")
  - Dynamic rows (Description, Unit, Price)
- **Section 2 (Optional):**
  - Toggle to show/hide
  - Custom title
  - Separate rows table
- **Notes Section:**
  - Multi-line textarea
  - Preserves line breaks (`whiteSpace: 'pre-wrap'`)
  - Default: "This quote is good for 30 days from date of service..."
- **Smart Pagination:**
  - Calculates table heights
  - Moves notes to new page if content exceeds 690px threshold
  - Handles multiple sections + summary table

**Pagination Logic:**
- Single page if content fits
- Two pages if summary/notes exceed threshold
- Dynamic height calculation based on row content

---

### Step 6: Project Images (`Step6.tsx`)
**Page Number:** `4 + totalInvoicePages + totalRepairEstimatePages + 1`  
**Purpose:** Select and display project images (max 4)

**Features:**
- Image selection from `scrapedImages`
- Maximum 4 images allowed
- Grid display of available images
- Selected images preview
- Image quality preserved (PNG format in PDF)

**Data:**
- `selectedImages`: Array of chosen `ImageItem[]`
- Images displayed in 2x2 grid layout

---

### Step 7: Repair Estimate Recommendations (`Step7.tsx`)
**Page Numbers:** Dynamic (after Step 6)  
**Purpose:** Create detailed repair estimate pages with images

**Features:**
- **Multiple Recommendation Pages:**
  - Each page has a review image
  - Custom recommendation text (optional)
  - Repair estimate data table

- **Page Management:**
  - Add new recommendation page (selects review image)
  - Delete pages
  - Navigate between pages
  - Change images on existing pages

- **Data Entry Modes:**
  - **Predefined Items:** Select from dropdown with 404 predefined options
    - Each item has description, unit, price, and recommendation text
  - **Manual Entry:** Add custom rows individually
  - **Bulk Manual Entry:** Add multiple custom rows

- **Smart Pagination:**
  - 1 row or less = 1 page
  - Multiple rows = 2 pages (table page + image page)

- **Image Tracking:**
  - Tracks `usedReviewImages` to prevent duplicate usage
  - Removes used images from available selection

**Component Flow:**
```
Step 7 Setup → Select Review Image → Create Page → Add Rows → Generate Pages
```

---

### Step 8: Inspection Images (`Step8.tsx`)
**Page Numbers:** Dynamic (after Step 7)  
**Purpose:** Display remaining unused images

**Features:**
- Shows images NOT used in:
  - Step 6 (selected project images)
  - Step 7 (review images for recommendations)
- **9 images per page**
- Grid layout (3x3)
- Pagination for multiple pages

**Calculation:**
```typescript
unusedImages = allImages - selectedImages - usedReviewImages
totalImagePages = Math.ceil(unusedImages.length / 9)
```

---

### Step 9: Documentation (`Step9-part1.tsx`, `Step9-part2.tsx`, `Step9-part3.tsx`)
**Page Numbers:** Last 8 pages (Step 9 = 3 pages, Step 10 = 5 pages)  
**Purpose:** Chimney-specific documentation

**Pages:**
- **Part 1:** Initial documentation
- **Part 2:** Additional documentation
- **Part 3:** Final documentation

**Content:** Static documentation based on chimney type
- Masonry chimney documentation
- Prefabricated chimney documentation
- Different content for each type

**Note:** Non-editable static pages showing industry documentation.

---

### Step 10: Final Steps (`Step10Part1.tsx` through `Step10Part5.tsx`)
**Page Numbers:** Last 5 pages  
**Purpose:** Final report completion and review

**Parts:**
1. **Part 1:** Final inspection documentation
2. **Part 2:** Completion documentation and summary
3. **Part 3:** Additional verification details
4. **Part 4:** Quality assurance and compliance
5. **Part 5:** Ultimate completion and delivery

**Content:** Static final documentation pages  
**Note:** Same content regardless of chimney type (5 pages always)

---

## 📄 PDF Generation & Upload

### Generation Process (`MultiStepForm.tsx` → `generatePDF()`)

**Steps:**

1. **Validation:**
   - Checks if preview div exists
   - Ensures user is on form step

2. **Clone Content:**
   - Creates temporary off-screen container (position: absolute, left: -9999px)
   - Clones preview content
   - Adjusts for PDF dimensions (595px × 842px A4)
   - Mobile-specific adjustments for PDF generation

3. **Render Pages:**
   - Uses `ReactDOM.createRoot()` to render each page
   - Waits for rendering to complete (100ms delay)
   - Renders only `includedPages` (user can toggle pages on/off)

4. **Convert to Canvas:**
   - Uses `html2canvas` library
   - Different scale factors per step:
     - Steps 1, 5: Scale 2x
     - Steps 2, 3, 9, 10: Scale 3x
     - Step 7: Scale 3x
     - Default: Scale 2x
   - Image format:
     - Step 6, Steps 2-3, Steps 7, 9, 10: PNG (high quality)
     - Others: JPEG (compressed)

5. **Generate PDF:**
   - Uses `jsPDF` library
   - Creates PDF with A4 dimensions
   - Adds each page as image
   - Compresses PDF

6. **Save PDF:**
   - Generates filename: `chimney_report_{clientName}_{date}.pdf`
   - Downloads PDF to user's device

7. **Upload to Backend:**
   - **Loading State:** Shows "Uploading report..." overlay
   - **API Call:**
     ```typescript
     POST https://admin-backend-stepintime.onrender.com/upload
     Headers: { 'X-API-Key': API_KEY }
     Body: FormData {
       file: PDF Blob,
       website: 'mysite',
       prefix: 'pdfs',
       client_name: dynamicClientName
     }
     ```
   - **Success/Failure:** Shows alert with result
   - **Error Handling:** Catches and displays upload errors

**Environment Variables:**
- `REACT_APP_API_BASE`: Backend URL
- `REACT_APP_API_KEY`: API authentication key

**Loading Overlays:**
- "Generating PDF..." (during PDF creation)
- "Uploading report..." (during upload)

---

## 📚 Library Feature

### Location: `/library` route

### Component: `Library.tsx`

**Purpose:** File manager for browsing uploaded reports

**Features:**

1. **Directory Navigation:**
   - Fetches root directories from backend
   - Click directory to drill down
   - Breadcrumb navigation
   - Loading states during navigation

2. **Search Functionality:**
   - Filters directories and files by name
   - Real-time search as user types

3. **File Display:**
   - Lists PDF files in current directory
   - Shows file metadata (size, last modified)
   - Preview button (opens PDF in modal)
   - Download button (programmatic download - hides signed URLs)

4. **PDF Preview Modal:**
   - Opens PDF in iframe
   - Loading spinner while loading
   - Close button
   - Full-screen modal overlay

5. **Download:**
   - Programmatic download via `window.open()`
   - Fallback to temporary `<a>` element if popup blocked
   - Prevents signed URLs from appearing in HTML source

6. **API Integration:**
   ```typescript
   GET https://admin-backend-stepintime.onrender.com/directories
   GET https://admin-backend-stepintime.onrender.com/directories?bucket=...&prefix=...
   Headers: { 'X-API-Key': API_KEY }
   ```

**UI Features:**
- Theme colors (red/burgundy scheme)
- Responsive design
- Loading indicators
- Error handling
- Empty state messages

**Navigation:**
- Click directory → Navigate into it
- Click breadcrumb → Navigate to that level
- Click "Report Library" → Navigate to root

---

## 🔄 Complete User Flow

```
1. App Loads
   ↓
2. Authentication Check
   ├─→ Not Authenticated → Login Component
   │     ├─→ Enter Email/Password
   │     ├─→ Receive OTP Email
   │     └─→ Enter OTP → Authenticated
   │
   └─→ Authenticated → MultiStepForm or Library
   
3. MultiStepForm Starts
   ↓
4. Data Collection
   ├─→ Option A: DataScraper
   │     ├─→ Enter URL
   │     ├─→ Scrape Data
   │     ├─→ Review/Edit Data
   │     └─→ Proceed to Form
   │
   └─→ Option B: Manual Entry
         └─→ Proceed to Form
   
5. Form Steps (Navigate via Next/Previous buttons)
   Step 1 → Step 2 → Step 3 → Step 4 → Step 5 → Step 6 → Step 7 → Step 8 → Step 9 → Step 10
   
6. PDF Generation
   ├─→ Click "Generate PDF"
   ├─→ Show "Generating PDF..." overlay
   ├─→ Generate PDF
   ├─→ Download PDF to device
   ├─→ Show "Uploading report..." overlay
   ├─→ Upload to backend
   └─→ Show success/failure alert
   
7. Library Access (Optional)
   └─→ Browse uploaded reports
       ├─→ Navigate directories
       ├─→ Preview PDFs
       └─→ Download PDFs
```

---

## 🎯 Key Technical Details

### State Management
- **Form Data:** Centralized in `MultiStepForm.tsx` (`formData` state)
- **Page Navigation:** `currentPage` state tracks PDF page number
- **Logical Steps:** Calculated from `currentPage` via `getLogicalStep()`
- **Included Pages:** `includedPages` Set tracks which pages to include in PDF

### Image Management
- **Scraped Images:** All images from DataScraper
- **Selected Images:** Images chosen for Step 6 (max 4)
- **Used Review Images:** Images used in Step 7 recommendations
- **Unused Images:** Remaining images displayed in Step 8

### PDF Page Calculation
```typescript
totalPages = 4                          // Steps 1-4
          + totalInvoicePages            // Step 5 (invoices)
          + totalRepairEstimatePages     // Step 5 (repair estimate)
          + 1                            // Step 6 (images)
          + max(1, totalRecommendationPages) // Step 7
          + totalImagePages              // Step 8
          + 3                            // Step 9
          + 5                            // Step 10
```

### Environment Variables Required
```env
REACT_APP_API_BASE=https://admin-backend-stepintime.onrender.com
REACT_APP_API_KEY=bestcompanyever23325
REACT_APP_SUPABASE_URL=https://pqxzjegpbavcxzyqxhbr.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📦 Key Dependencies

- **React 18** with TypeScript
- **Tailwind CSS** - Styling
- **html2canvas** - PDF generation (HTML to canvas)
- **jsPDF** - PDF creation and manipulation
- **@supabase/supabase-js** - Authentication
- **ReactDOM** - Server-side rendering for PDF pages

---

## 🎨 Theme Colors

- Primary: `#722420` (Burgundy/Red)
- Secondary: `#F0D8D6` (Light Pink)
- Background: Red gradient (`from-red-50 to-red-100`)

---

This document provides a comprehensive overview of all steps and features in the SumoQuote v2 project. Each step is designed to collect specific information and generate a professional chimney service report PDF.



