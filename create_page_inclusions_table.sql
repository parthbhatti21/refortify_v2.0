-- Create table to store page inclusion status for reports
-- Run this in Supabase SQL Editor

-- Create the page_inclusions table
-- Note: report_id is TEXT to match how report IDs are stored/used in the application
CREATE TABLE IF NOT EXISTS public.page_inclusions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id TEXT NOT NULL,
  page_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(report_id, page_number)
);

-- Add foreign key constraint with explicit cast (since reports.id might be UUID)
-- We'll handle the relationship in application code and RLS policies instead

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_page_inclusions_report_id ON public.page_inclusions(report_id);
CREATE INDEX IF NOT EXISTS idx_page_inclusions_page_number ON public.page_inclusions(page_number);

-- Enable Row Level Security
ALTER TABLE public.page_inclusions ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see page inclusions for reports they created
CREATE POLICY "Users can view their own page inclusions"
  ON public.page_inclusions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.reports
      WHERE reports.id::TEXT = page_inclusions.report_id
      AND reports.created_by = auth.uid()
    )
  );

-- Create policy: Users can insert page inclusions for their own reports
CREATE POLICY "Users can insert their own page inclusions"
  ON public.page_inclusions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.reports
      WHERE reports.id::TEXT = page_inclusions.report_id
      AND reports.created_by = auth.uid()
    )
  );

-- Create policy: Users can update page inclusions for their own reports
CREATE POLICY "Users can update their own page inclusions"
  ON public.page_inclusions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.reports
      WHERE reports.id::TEXT = page_inclusions.report_id
      AND reports.created_by = auth.uid()
    )
  );

-- Create policy: Users can delete page inclusions for their own reports
CREATE POLICY "Users can delete their own page inclusions"
  ON public.page_inclusions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.reports
      WHERE reports.id::TEXT = page_inclusions.report_id
      AND reports.created_by = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_page_inclusions_updated_at
  BEFORE UPDATE ON public.page_inclusions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE public.page_inclusions IS 'Stores which pages are included in PDF generation for each report, indexed by page number';

