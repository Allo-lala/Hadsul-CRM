-- Seed Data for Hadsul CRM
-- Insert sample data for development/testing

-- Insert default shift types
INSERT INTO shift_types (id, care_home_id, name, start_time, end_time, color, break_duration, is_night_shift) VALUES
  (uuid_generate_v4(), NULL, 'Early Morning', '06:00', '14:00', '#22C55E', 30, false),
  (uuid_generate_v4(), NULL, 'Day Shift', '08:00', '20:00', '#3B82F6', 60, false),
  (uuid_generate_v4(), NULL, 'Late Shift', '14:00', '22:00', '#F59E0B', 30, false),
  (uuid_generate_v4(), NULL, 'Night Shift', '20:00', '08:00', '#8B5CF6', 30, true),
  (uuid_generate_v4(), NULL, 'Short Day', '09:00', '17:00', '#06B6D4', 30, false);

-- Insert mandatory training courses
INSERT INTO training_courses (id, name, description, category, is_mandatory, validity_months) VALUES
  (uuid_generate_v4(), 'Safeguarding Adults', 'Level 2 Safeguarding training for care staff', 'Safeguarding', true, 12),
  (uuid_generate_v4(), 'Moving and Handling', 'Safe techniques for moving and positioning residents', 'Health & Safety', true, 12),
  (uuid_generate_v4(), 'Fire Safety', 'Fire prevention, evacuation procedures and equipment use', 'Health & Safety', true, 12),
  (uuid_generate_v4(), 'First Aid', 'Emergency first aid at work certification', 'Health & Safety', true, 36),
  (uuid_generate_v4(), 'Infection Control', 'Preventing spread of infections in care settings', 'Clinical', true, 12),
  (uuid_generate_v4(), 'Food Hygiene', 'Level 2 food safety and hygiene', 'Health & Safety', true, 36),
  (uuid_generate_v4(), 'Medication Administration', 'Safe administration and management of medications', 'Clinical', true, 12),
  (uuid_generate_v4(), 'GDPR & Data Protection', 'Handling personal and sensitive data', 'Compliance', true, 24),
  (uuid_generate_v4(), 'Mental Capacity Act', 'Understanding and applying MCA principles', 'Legal', true, 24),
  (uuid_generate_v4(), 'Dementia Awareness', 'Understanding dementia and person-centered care', 'Clinical', true, 24),
  (uuid_generate_v4(), 'Health and Safety', 'General workplace health and safety', 'Health & Safety', true, 12),
  (uuid_generate_v4(), 'Equality and Diversity', 'Promoting equality in the workplace', 'Compliance', true, 36);

-- Note: Care homes and users will be created through the application
-- Super admin user should be created via Clerk and linked in the users table
