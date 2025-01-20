/*
  # Add email field to profiles table

  1. Changes
    - Add email field to profiles table
    - Make it required (NOT NULL)
    - Add unique constraint
    - Add index for faster lookups

  2. Notes
    - Email must be unique across all profiles
    - Index added to improve query performance when searching by email
    - Uses a two-step process to handle existing rows:
      1. Add column as nullable
      2. Update existing rows with email from auth.users
      3. Add NOT NULL constraint
*/

-- Add email column as nullable first
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text;

-- Update existing profiles with email from auth.users
UPDATE profiles
SET email = auth.users.email
FROM auth.users
WHERE profiles.id = auth.users.id;

-- Now make it NOT NULL and add constraints
ALTER TABLE profiles 
  ALTER COLUMN email SET NOT NULL,
  ADD CONSTRAINT profiles_email_unique UNIQUE (email);

-- Add index for performance
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles (email);