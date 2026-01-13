# Step6 Multi-Page Image Support - Migration Guide

## Overview
This update adds support for saving and loading Step6 multi-page images with proper page number tracking when editing existing reports from the Library section.

## Changes Made

### 1. Database Schema Updates (`add_step6_page_support.sql`)

Run this SQL script in your Supabase database. It performs three main operations:

#### Part 1: step6_json Table Structure
The `step6_json` table stores all Step6 data in JSONB format. No schema changes are needed, but the data structure is enhanced:

```json
{
  "Selected Images": [
    {
      "id": "string",
      "url": "string",
      "positionX": number,
      "positionY": number,
      "width": number,
      "height": number,
      "pageNumber": number  // ← NEW: Page assignment (1-indexed)
    }
  ],
  "Text Position": {
    "x": number,
    "y": number
  },
  "Current Page": number,    // ← NEW: Currently viewed page
  "Total Pages": number       // ← NEW: Total pages in Step6
}
```

Indexes added for better performance:
```sql
CREATE INDEX IF NOT EXISTS idx_step6_json_report_id ON step6_json(report_id);
CREATE INDEX IF NOT EXISTS idx_step6_json_data ON step6_json USING GIN(data);
```

#### Part 2: reports Table Updates
Adds metadata columns to track Step6 page state:

```sql
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS step6_current_page INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS step6_total_pages INTEGER DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_reports_step6_pages 
ON reports(step6_current_page, step6_total_pages);
```

#### Part 3: Existing Data Migration
Updates existing `step6_json` records to ensure backward compatibility:

- Adds `pageNumber: 1` to all existing images without page numbers
- Adds `Current Page: 1` and `Total Pages: 1` to existing records
- No data loss - all existing reports will work seamlessly

```sql
-- Automatically adds pageNumber to existing images
UPDATE step6_json
SET data = jsonb_set(...)
WHERE data ? 'Selected Images'
  AND EXISTS (SELECT 1 FROM jsonb_array_elements(...) WHERE NOT (img ? 'pageNumber'));
```

### 2. Code Changes (`MultiStepForm.tsx`)

#### Loading Step6 Data (Line ~1161-1173)
- Now loads `pageNumber` property from each image
- Loads `step6CurrentPage` and `step6TotalPages` from step6_json

```typescript
selectedImages: (step6j['Selected Images'] || []).map((img: any) => ({ 
  id: img.id, 
  url: img.url,
  positionX: img.positionX,
  positionY: img.positionY,
  width: img.width,
  height: img.height,
  pageNumber: img.pageNumber || 1  // ← NEW
})),
step6CurrentPage: step6j['Current Page'] || 1,  // ← NEW
step6TotalPages: step6j['Total Pages'] || 1,    // ← NEW
```

#### Saving Step6 Data (Line ~2307-2322 and ~2944-2963)
- Now saves `pageNumber` with each image
- Saves `Current Page` and `Total Pages` metadata

```typescript
const step6Json = {
  'Selected Images': (formData.selectedImages || []).map(img => ({ 
    id: img.id, 
    url: img.url,
    positionX: img.positionX,
    positionY: img.positionY,
    width: img.width,
    height: img.height,
    pageNumber: img.pageNumber || 1  // ← NEW
  })),
  'Text Position': {
    x: formData.step6TextPositionX,
    y: formData.step6TextPositionY
  },
  'Current Page': formData.step6CurrentPage || 1,   // ← NEW
  'Total Pages': formData.step6TotalPages || 1      // ← NEW
};
```

## How It Works

### When Creating a New Report:
1. User scrapes images from DataScraper
2. User selects images for Step6
3. Images are automatically distributed across pages (max 4 per page recommended)
4. User can drag/resize images and position them
5. Each image is assigned a `pageNumber` (1-indexed)
6. When saved, all image positions and page assignments are stored in `step6_json`

### When Editing an Existing Report:
1. User clicks "Edit" in Library section
2. System loads report data including `step6_json`
3. Images are loaded with their `pageNumber`, `positionX`, `positionY`, `width`, `height`
4. Step6 component reconstructs the multi-page layout
5. User sees images on their assigned pages with correct positions
6. User can continue editing and changes are saved back to database

## Migration Steps

1. **Run the SQL migration:**
   ```bash
   # In Supabase SQL Editor or via CLI
   psql -h <your-supabase-host> -U postgres -d postgres < add_step6_page_support.sql
   ```

2. **Deploy the code changes:**
   - The `MultiStepForm.tsx` changes are already applied
   - Test locally first
   - Deploy to production

3. **Backward Compatibility:**
   - Existing reports without `pageNumber` will default to page 1
   - No data loss will occur
   - Old reports will work with the new system

## Testing Checklist

- [ ] Create a new report with multiple Step6 pages
- [ ] Save the report
- [ ] Edit the report from Library
- [ ] Verify images appear on correct pages with correct positions
- [ ] Edit existing old report (created before migration)
- [ ] Verify it loads with default page 1
- [ ] Add/remove pages in Step6
- [ ] Verify changes persist after save

## Data Structure Reference

### FormData Interface (TypeScript)
```typescript
interface ImageItem {
  id: string;
  url: string;
  alt?: string;
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
  pageNumber?: number;  // 1-indexed page number
}

interface FormData {
  // ... other fields
  selectedImages?: ImageItem[];
  step6TextPositionX?: number;
  step6TextPositionY?: number;
  step6CurrentPage?: number;    // 1-indexed
  step6TotalPages?: number;
}
```

### Database Tables
- **reports**: Contains basic report info + step6_current_page, step6_total_pages columns
- **step6_json**: Stores complete Step6 state in JSONB format (linked to report_id)

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify SQL migration ran successfully
3. Check that step6_json data has the correct structure
4. Ensure images have valid URLs and are accessible

## Future Enhancements

- Per-page text positions (currently global)
- Drag images between pages in UI
- Image library/gallery view
- Bulk image operations
