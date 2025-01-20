/*
  # Add INSERT policy for profiles table

  1. Changes
    - Add INSERT policy for authenticated users to create their own profile

  Note: This migration assumes the profiles table already exists from a previous migration
*/

-- Add INSERT policy if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;