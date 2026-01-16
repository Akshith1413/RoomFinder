-- Create users/profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  user_type TEXT CHECK (user_type IN ('finder', 'owner')), -- 'finder' or 'owner'
  first_name TEXT,
  last_name TEXT,
  phone_number TEXT,
  profile_image_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  rent_price INTEGER NOT NULL,
  property_type TEXT NOT NULL CHECK (property_type IN ('1 BHK', '2 BHK', '1 Bed', '2 Bed', '3 Bed')),
  tenant_preference TEXT NOT NULL CHECK (tenant_preference IN ('Bachelor', 'Family', 'Girls', 'Working')),
  owner_contact_number TEXT NOT NULL,
  amenities TEXT[], -- Array of amenities
  area_sqft INTEGER,
  floor_number INTEGER,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create room images table
CREATE TABLE IF NOT EXISTS public.room_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create saved rooms table (for favorites)
CREATE TABLE IF NOT EXISTS public.saved_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, room_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_rooms ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "profiles_select_public" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Rooms RLS Policies
CREATE POLICY "rooms_select_all" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "rooms_insert_owner" ON public.rooms FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "rooms_update_owner" ON public.rooms FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "rooms_delete_owner" ON public.rooms FOR DELETE USING (auth.uid() = owner_id);

-- Room Images RLS Policies
CREATE POLICY "room_images_select_all" ON public.room_images FOR SELECT USING (true);
CREATE POLICY "room_images_insert_owner" ON public.room_images FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.rooms WHERE id = room_id AND owner_id = auth.uid())
);
CREATE POLICY "room_images_delete_owner" ON public.room_images FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.rooms WHERE id = room_id AND owner_id = auth.uid())
);

-- Saved Rooms RLS Policies
CREATE POLICY "saved_rooms_select_own" ON public.saved_rooms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "saved_rooms_insert_own" ON public.saved_rooms FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saved_rooms_delete_own" ON public.saved_rooms FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_rooms_location ON public.rooms(location);
CREATE INDEX idx_rooms_owner_id ON public.rooms(owner_id);
CREATE INDEX idx_room_images_room_id ON public.room_images(room_id);
CREATE INDEX idx_saved_rooms_user_id ON public.saved_rooms(user_id);
CREATE INDEX idx_saved_rooms_room_id ON public.saved_rooms(room_id);
