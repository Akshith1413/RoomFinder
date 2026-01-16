-- Create storage bucket for room images
INSERT INTO storage.buckets (id, name, public)
VALUES ('room-images', 'room-images', true)
ON CONFLICT DO NOTHING;

-- Set up RLS policies for room images storage
CREATE POLICY "Public access to room images" ON storage.objects
  FOR SELECT USING (bucket_id = 'room-images');

CREATE POLICY "Authenticated users can upload room images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'room-images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their own room images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'room-images'
    AND auth.uid() = owner
  );
