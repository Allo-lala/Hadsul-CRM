-- Migration: Add is_late flag to clock_records
ALTER TABLE clock_records ADD COLUMN IF NOT EXISTS is_late BOOLEAN DEFAULT false;
