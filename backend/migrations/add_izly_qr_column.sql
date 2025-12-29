-- Migration: Add Izly Identifier QR Code Storage
-- Description: Adds a column to cache the Izly identifier QR code permanently
-- Date: 2025-12-29

-- Add the new column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS izly_identifier_qr_base64 TEXT;

-- Add comment for documentation
COMMENT ON COLUMN profiles.izly_identifier_qr_base64 IS 
'Base64-encoded PNG image of the user''s permanent Izly identifier QR code. Generated once during import and cached for performance.';

-- Optional: Create an index if you plan to query by QR existence
-- CREATE INDEX idx_profiles_has_qr ON profiles((izly_identifier_qr_base64 IS NOT NULL));
