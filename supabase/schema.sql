-- Supabase Database Schema for Tools SaaS Platform

-- 1. Profiles Table (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tools Table (Metadata about available tools)
CREATE TABLE IF NOT EXISTS tools (
  id TEXT PRIMARY KEY, -- e.g., 'pdf-metadata'
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'Live',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tool Usage Logs (Tracks usage)
CREATE TABLE IF NOT EXISTS tool_usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  tool_id TEXT REFERENCES tools(id) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB -- Optional context about the usage
);

-- 4. Uploaded Files (Tracks files in Supabase Storage)
CREATE TABLE IF NOT EXISTS uploaded_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL, -- Path in Supabase bucket
  bucket_name TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Processed Results (Stores output data)
CREATE TABLE IF NOT EXISTS processed_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  tool_id TEXT REFERENCES tools(id) NOT NULL,
  input_file_id UUID REFERENCES uploaded_files(id),
  result_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Subscriptions (Basic subscription tracking)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  plan_id TEXT NOT NULL, -- e.g., 'free', 'pro'
  status TEXT NOT NULL, -- e.g., 'active', 'canceled'
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Tools: Everyone can read tools, nobody can write (except via DB admin)
CREATE POLICY "Tools are viewable by everyone" ON tools FOR SELECT USING (true);

-- Tool Usage Logs: Users can only see their own logs
CREATE POLICY "Users can view own usage logs" ON tool_usage_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usage logs" ON tool_usage_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Uploaded Files: Users can only see and manage their own files
CREATE POLICY "Users can view own files" ON uploaded_files FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own files" ON uploaded_files FOR ALL USING (auth.uid() = user_id);

-- Processed Results: Users can only see their own results
CREATE POLICY "Users can view own results" ON processed_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own results" ON processed_results FOR ALL USING (auth.uid() = user_id);

-- Subscriptions: Users can only see their own subscription
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Trigger for creating profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
