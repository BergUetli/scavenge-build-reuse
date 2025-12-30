-- Drop the existing check constraint on difficulty_level
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_difficulty_level_check;

-- Add new check constraint with expanded difficulty levels
ALTER TABLE projects ADD CONSTRAINT projects_difficulty_level_check 
  CHECK (difficulty_level IN ('Novice', 'Easy', 'Beginner', 'Intermediate', 'Advanced', 'Expert'));