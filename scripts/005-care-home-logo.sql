-- Migration: Add logo_url to care_homes table
ALTER TABLE care_homes ADD COLUMN IF NOT EXISTS logo_url TEXT;
