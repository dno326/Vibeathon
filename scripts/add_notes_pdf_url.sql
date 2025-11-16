-- Add pdf_url to notes to reference original PDF in storage
ALTER TABLE notes ADD COLUMN IF NOT EXISTS pdf_url text;

-- (RLS remains the same; delete/update policies already limit to creator or service)
