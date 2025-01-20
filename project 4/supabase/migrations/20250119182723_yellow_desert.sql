/*
  # Add avatar storage configuration
  
  1. Storage
    - Create avatars bucket for storing user profile pictures
    - Enable public access for avatar images
  
  2. Notes
    - Uses storage.buckets instead of direct bucket creation
    - Enables RLS on the bucket
    - Sets up proper bucket configuration
*/

-- Create storage bucket for avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on the bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies for the storage.objects table
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatar images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatar image"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "Users can delete their own avatar image"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');