-- Add support for Step6 multi-page images with page numbers
-- This migration updates the step6_json table structure and adds metadata columns to reports table

-- =====================================================================
-- PART 1: step6_json table (stores image data and positions)
-- =====================================================================
-- The step6_json table structure:
-- CREATE TABLE step6_json (
--   report_id UUID PRIMARY KEY REFERENCES reports(id) ON DELETE CASCADE,
--   data JSONB NOT NULL,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- No schema changes needed for step6_json table since it uses JSONB.
-- The JSONB 'data' column now stores this enhanced structure:
-- {
--   "Selected Images": [
--     {
--       "id": "string",
--       "url": "string",
--       "positionX": number,
--       "positionY": number,
--       "width": number,
--       "height": number,
--       "pageNumber": number      <-- NEW: Page assignment (1-indexed)
--     }
--   ],
--   "Text Position": {
--     "x": number,
--     "y": number
--   },
--   "Current Page": number,         <-- NEW: Currently viewed page
--   "Total Pages": number            <-- NEW: Total pages in Step6
-- }

-- Add/update indexes for better JSONB query performance
CREATE INDEX IF NOT EXISTS idx_step6_json_report_id ON step6_json(report_id);
CREATE INDEX IF NOT EXISTS idx_step6_json_data ON step6_json USING GIN(data);

-- =====================================================================
-- PART 2: reports table (stores Step6 page metadata)
-- =====================================================================
-- Add columns to reports table to track Step6 page state
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS step6_current_page INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS step6_total_pages INTEGER DEFAULT 1;

-- Create index for faster queries on these columns
CREATE INDEX IF NOT EXISTS idx_reports_step6_pages 
ON reports(step6_current_page, step6_total_pages);

-- Update existing reports to have default values (1 page)
UPDATE reports 
SET step6_current_page = 1, 
    step6_total_pages = 1
WHERE step6_current_page IS NULL 
   OR step6_total_pages IS NULL;

-- Add comments explaining the columns
COMMENT ON COLUMN reports.step6_current_page IS 'Current page number being viewed in Step6 (1-indexed)';
COMMENT ON COLUMN reports.step6_total_pages IS 'Total number of pages in Step6 for this report';

-- =====================================================================
-- PART 3: Update existing step6_json records to include page numbers
-- =====================================================================
-- For existing records, ensure all images have pageNumber = 1 (default)
-- This ensures backward compatibility with old reports
UPDATE step6_json
SET data = jsonb_set(
  data,
  '{Selected Images}',
  (
    SELECT jsonb_agg(
      CASE 
        WHEN img ? 'pageNumber' THEN img
        ELSE img || jsonb_build_object('pageNumber', 1)
      END
    )
    FROM jsonb_array_elements(data->'Selected Images') AS img
  ),
  true
)
WHERE data ? 'Selected Images'
  AND EXISTS (
    SELECT 1 
    FROM jsonb_array_elements(data->'Selected Images') AS img
    WHERE NOT (img ? 'pageNumber')
  );

-- Add Current Page and Total Pages if not present
UPDATE step6_json
SET data = data || jsonb_build_object('Current Page', 1, 'Total Pages', 1)
WHERE NOT (data ? 'Current Page')
   OR NOT (data ? 'Total Pages');

-- =====================================================================
-- Verification queries (uncomment to check after migration)
-- =====================================================================
-- SELECT report_id, 
--        data->'Current Page' as current_page,
--        data->'Total Pages' as total_pages,
--        jsonb_array_length(data->'Selected Images') as image_count
-- FROM step6_json
-- LIMIT 10;

-- SELECT id, client_name, step6_current_page, step6_total_pages
-- FROM reports
-- WHERE step6_total_pages > 1
-- LIMIT 10;
