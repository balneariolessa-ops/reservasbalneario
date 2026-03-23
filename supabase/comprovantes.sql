-- Create the storage bucket for receipts if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for public access and uploads
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'receipts' );

CREATE POLICY "Allow Uploads" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'receipts' );

-- Add columns to the tables
ALTER TABLE public.kiosk_reservations ADD COLUMN IF NOT EXISTS receipt_url TEXT;
ALTER TABLE public.atv_reservations ADD COLUMN IF NOT EXISTS receipt_url TEXT;
